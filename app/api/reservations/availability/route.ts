import { NextRequest, NextResponse } from "next/server"
import { invalidRequest } from "@/lib/invalid-request"
import { prisma } from "@/lib/prisma"
import {
  getReservationBusinessDate,
  isReservationBusinessDay,
  reservationAvailabilityQuerySchema,
  reservationLocalDateTimeToDate,
} from "@/lib/schemas/reservations"
import { getCurrentUser, MESSAGE_UNAUTHENTICATED } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { error: MESSAGE_UNAUTHENTICATED },
      { status: 401 }
    )
  }

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
  const businessDate = getReservationBusinessDate(rangeStart)

  if (!isReservationBusinessDay(businessDate)) {
    return NextResponse.json([], { status: 200 })
  }

  const businessStart = reservationLocalDateTimeToDate(
    businessDate,
    "08:00"
  ).getTime()
  const businessEnd = reservationLocalDateTimeToDate(
    businessDate,
    "20:00"
  ).getTime()
  const rangeStartTime = Math.max(
    rangeStart.getTime(),
    businessStart,
    Date.now()
  )
  const rangeEndTime = Math.min(rangeEnd.getTime(), businessEnd)

  if (rangeEndTime <= rangeStartTime) {
    return NextResponse.json([], { status: 200 })
  }

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
      startAt: { lt: new Date(rangeEndTime) },
      endAt: { gt: new Date(rangeStartTime) },
    },
    select: { startAt: true, endAt: true },
    orderBy: { startAt: "asc" },
  })

  const availableIntervals: Array<{ startAt: string; endAt: string }> = []
  const minuteInMilliseconds = 60_000
  const minimumIntervalInMilliseconds = 15 * minuteInMilliseconds
  let cursor = rangeStartTime

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
