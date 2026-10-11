import { NextRequest, NextResponse } from "next/server"
import { invalidRequest } from "@/lib/invalid-request"
import { prisma } from "@/lib/prisma"
import {
  createReservationSchema,
  reservationAvailabilityQuerySchema,
} from "@/lib/schemas/reservations"

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
  const result = reservationAvailabilityQuerySchema.safeParse({
    roomId: searchParams.get("roomId"),
    startAt: searchParams.get("startAt"),
    endAt: searchParams.get("endAt"),
  })

  if (!result.success) return invalidRequest(result.error)

  const { roomId, startAt, endAt } = result.data
  const rangeStart = new Date(startAt)
  const rangeEnd = new Date(endAt)

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { id: true },
  })

  if (!room) {
    return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 })
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      roomId,
      status: "ACTIVE",
      startAt: { lt: rangeEnd },
      endAt: { gt: rangeStart },
    },
    select: { startAt: true, endAt: true },
    orderBy: { startAt: "asc" },
  })

  const availableIntervals: Array<{ startAt: string; endAt: string }> = []
  const minuteInMilliseconds = 60_000
  const minimumIntervalInMilliseconds = 15 * minuteInMilliseconds
  let cursor = Math.max(rangeStart.getTime(), Date.now())
  const rangeEndTime = rangeEnd.getTime()

  function addAvailableInterval(startTime: number, endTime: number) {
    const roundedStart =
      Math.ceil(startTime / minuteInMilliseconds) * minuteInMilliseconds
    const roundedEnd =
      Math.floor(endTime / minuteInMilliseconds) * minuteInMilliseconds

    if (roundedEnd - roundedStart < minimumIntervalInMilliseconds) return

    availableIntervals.push({
      startAt: new Date(roundedStart).toISOString(),
      endAt: new Date(roundedEnd).toISOString(),
    })
  }

  for (const reservation of reservations) {
    const reservationStart = Math.max(
      reservation.startAt.getTime(),
      rangeStart.getTime()
    )
    const reservationEnd = Math.min(reservation.endAt.getTime(), rangeEndTime)

    addAvailableInterval(cursor, reservationStart)
    cursor = Math.max(cursor, reservationEnd)
  }

  addAvailableInterval(cursor, rangeEndTime)

  return NextResponse.json(availableIntervals, { status: 200 })
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
            status: "ACTIVE",
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
