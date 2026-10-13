import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { DELETE } from "../../app/api/reservations/[id]/route"
import { GET, POST } from "../../app/api/reservations/route"
import {
  isReservationBusinessDay,
  reservationLocalDateTimeToDate,
} from "../../lib/schemas/reservations"

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  roomFindUnique: vi.fn(),
  reservationFindFirst: vi.fn(),
  reservationCreate: vi.fn(),
  reservationFindMany: vi.fn(),
  reservationFindUnique: vi.fn(),
  reservationDelete: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mocks.getCurrentUser,
  MESSAGE_UNAUTHENTICATED: "Não autenticado.",
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    reservation: {
      findFirst: mocks.reservationFindFirst,
      findMany: mocks.reservationFindMany,
      findUnique: mocks.reservationFindUnique,
      create: mocks.reservationCreate,
      delete: mocks.reservationDelete,
    },
  },
}))

function nextBusinessDate() {
  const date = new Date()
  date.setUTCHours(12, 0, 0, 0)

  do {
    date.setUTCDate(date.getUTCDate() + 1)
  } while (!isReservationBusinessDay(date.toISOString().slice(0, 10)))

  return date.toISOString().slice(0, 10)
}

function createReservationRequest() {
  const date = nextBusinessDate()
  const startAt = reservationLocalDateTimeToDate(date, "10:00").toISOString()
  const endAt = reservationLocalDateTimeToDate(date, "11:00").toISOString()

  return {
    request: new NextRequest("http://localhost/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: "room-1", startAt, endAt }),
    }),
    startAt,
    endAt,
  }
}

describe("API de reservas", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1" })
    mocks.roomFindUnique.mockResolvedValue({ id: "room-1", maxDuration: 240 })
    mocks.reservationFindFirst.mockResolvedValue(null)
    mocks.reservationFindMany.mockResolvedValue([])
    mocks.reservationFindUnique.mockResolvedValue(null)
    mocks.transaction.mockImplementation(
      async (
        operation: (transactionClient: {
          room: { findUnique: typeof mocks.roomFindUnique }
          reservation: {
            findFirst: typeof mocks.reservationFindFirst
            create: typeof mocks.reservationCreate
          }
        }) => Promise<unknown>
      ) =>
        operation({
          room: { findUnique: mocks.roomFindUnique },
          reservation: {
            findFirst: mocks.reservationFindFirst,
            create: mocks.reservationCreate,
          },
        })
    )
  })

  it("lista somente reservas do usuário autenticado", async () => {
    const request = new NextRequest(
      "http://localhost/api/reservations?date=2026-10-13"
    )

    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mocks.reservationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-1" }),
      })
    )
  })

  it("rejeita sobreposição de horário na mesma sala", async () => {
    const { request, startAt, endAt } = createReservationRequest()
    mocks.reservationFindFirst.mockResolvedValue({ id: "existing-reservation" })

    const response = await POST(request)

    expect(response.status).toBe(409)
    expect(mocks.reservationFindFirst).toHaveBeenCalledWith({
      where: {
        roomId: "room-1",
        startAt: { lt: new Date(endAt) },
        endAt: { gt: new Date(startAt) },
      },
      select: { id: true },
    })
    expect(mocks.reservationCreate).not.toHaveBeenCalled()
  })

  it("não exclui reserva que não pertence ao usuário", async () => {
    const response = await DELETE(
      new NextRequest("http://localhost/api/reservations/other-reservation"),
      { params: Promise.resolve({ id: "other-reservation" }) }
    )

    expect(response.status).toBe(404)
    expect(mocks.reservationFindUnique).toHaveBeenCalledWith({
      where: { id: "other-reservation", userId: "user-1" },
      select: { id: true, startAt: true, endAt: true },
    })
    expect(mocks.reservationDelete).not.toHaveBeenCalled()
  })

  it("permite excluir reserva do próprio usuário", async () => {
    const startAt = reservationLocalDateTimeToDate(
      nextBusinessDate(),
      "10:00"
    )
    mocks.reservationFindUnique.mockResolvedValue({
      id: "owned-reservation",
      startAt,
      endAt: new Date(startAt.getTime() + 60 * 60_000),
    })

    const response = await DELETE(
      new NextRequest("http://localhost/api/reservations/owned-reservation"),
      { params: Promise.resolve({ id: "owned-reservation" }) }
    )

    expect(response.status).toBe(204)
    expect(mocks.reservationFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "owned-reservation", userId: "user-1" },
      })
    )
    expect(mocks.reservationDelete).toHaveBeenCalledWith({
      where: { id: "owned-reservation" },
    })
  })
})
