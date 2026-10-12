import { NextRequest, NextResponse } from "next/server"
import { invalidRequest } from "@/lib/invalid-request"
import { prisma } from "@/lib/prisma"
import { createReservationSchema } from "@/lib/schemas/reservations"
import z from "zod"

class ReservationRequestError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
  }
}
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const searchParamsDate = searchParams.get("date")

  let date: string | undefined
  try {
    if (searchParamsDate !== null) {
      const result = z.iso.date("Date é invalido.").safeParse(searchParamsDate)
      if (!result.success) return invalidRequest(result.error)
      date = result.data
    }
    if (!date) {
      return invalidRequest("Data é obrigatória.")
    }

    const startOfDay = new Date(`${date}T00:00:00`)
    const startOfNextDay = new Date(startOfDay)
    startOfNextDay.setDate(startOfNextDay.getDate() + 1)

    const reservations = await prisma.reservation.findMany({
      where: {
        startAt: { lt: startOfNextDay },
        endAt: { gt: startOfDay },
      },
      include: {
        room: {
          include: { resources: true },
        },
      },
      orderBy: { startAt: "asc" },
    })

    return NextResponse.json(reservations, { status: 200 })
  } catch (error) {
    console.error("Não foi possível buscar as reservas:", error)
    return NextResponse.json(
      { error: "Não foi possível buscar as reservas." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corpo JSON inválido." }, { status: 400 })
  }

  const result = createReservationSchema.safeParse(body)
  if (!result.success) return invalidRequest(result.error)

  const { roomId, userId, startAt, endAt } = result.data
  const startTime = new Date(startAt)
  const endTime = new Date(endAt)

  try {
    const reservation = await prisma.$transaction(
      async (transaction) => {
        const [room, user] = await Promise.all([
          transaction.room.findUnique({
            where: { id: roomId },
            select: { id: true },
          }),
          transaction.user.findUnique({
            where: { id: userId },
            select: { id: true },
          }),
        ])

        if (!room) {
          throw new ReservationRequestError("Sala não encontrada.", 404)
        } else if (!user) {
          throw new ReservationRequestError("Usuário não encontrado.", 404)
        }

        const overlappingReservation = await transaction.reservation.findFirst({
          where: {
            roomId,
            startAt: { lt: endTime },
            endAt: { gt: startTime },
          },
          select: { id: true },
        })

        if (overlappingReservation) {
          throw new ReservationRequestError(
            "Esta sala já está reservada nesse horário.",
            409
          )
        }

        return transaction.reservation.create({
          data: { roomId, userId, startAt: startTime, endAt: endTime },
        })
      },
      { isolationLevel: "Serializable" }
    )

    return NextResponse.json(reservation, { status: 201 })
  } catch (error) {
    if (error instanceof ReservationRequestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    console.error("Não foi possível criar a reserva:", error)
    return NextResponse.json(
      { error: "Não foi possível criar a reserva." },
      { status: 500 }
    )
  }
}
