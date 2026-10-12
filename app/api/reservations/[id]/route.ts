import { getCurrentUser, MESSAGE_UNAUTHENTICATED } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { error: MESSAGE_UNAUTHENTICATED },
      { status: 401 }
    )
  }

  const id = (await params).id

  if (!id) {
    return NextResponse.json({ error: "Id não informado." }, { status: 400 })
  }
  const reservation = await prisma.reservation.findUnique({
    where: { id, userId: user.id },
    select: { id: true, startAt: true, endAt: true },
  })

  if (!reservation) {
    return NextResponse.json(
      { error: "Reserva não encontrada." },
      { status: 404 }
    )
  }
  const now = new Date()
  if (reservation.startAt <= now && reservation.endAt > now) {
    return NextResponse.json(
      { error: "Reserva em andamento." },
      { status: 400 }
    )
  }

  try {
    await prisma.reservation.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Não foi possível excluir a reserva." },
      { status: 500 }
    )
  }
}
