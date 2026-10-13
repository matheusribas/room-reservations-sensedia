import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { TableReservations } from "../../app/(protected)/(reservation)/_components/table-reservation"

const mocks = vi.hoisted(() => ({
  useParamsReservations: vi.fn(),
  useListReservations: vi.fn(),
  mutateAsync: vi.fn(),
}))

vi.mock("../../app/(protected)/(reservation)/_hooks/useParamsReservation", () => ({
  useParamsReservations: mocks.useParamsReservations,
}))

vi.mock("@/hooks/reservation/use-list-reservations", () => ({
  useListReservations: mocks.useListReservations,
}))

vi.mock("@/hooks/reservation/use-delete-reservation", () => ({
  useDeleteReservation: () => ({ mutateAsync: mocks.mutateAsync }),
}))

vi.mock("@/components/shared/data-table", () => ({
  DataTable: ({
    data,
    columns,
    messageFeedback,
  }: {
    data: Array<{ id: string; room: { name: string } }>
    columns: Array<{ onDelete: (id: string) => void }>
    messageFeedback: string
  }) => (
    <div>
      {data.length === 0 ? (
        <p>{messageFeedback}</p>
      ) : (
        data.map((reservation) => (
          <div key={reservation.id}>
            <span>{reservation.room.name}</span>
            <button
              type="button"
              onClick={() => columns[0].onDelete(reservation.id)}
            >
              Excluir {reservation.room.name}
            </button>
          </div>
        ))
      )}
    </div>
  ),
}))

vi.mock("../../app/(protected)/(reservation)/_components/columns", () => ({
  columns: ({ onDelete }: { onDelete: (id: string) => void }) => [{ onDelete }],
}))

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PopoverTrigger: ({ render }: { render: React.ReactNode }) => render,
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    id,
    type,
  }: {
    children: React.ReactNode
    id?: string
    type?: "button" | "submit" | "reset"
  }) => (
    <button id={id} type={type}>
      {children}
    </button>
  ),
}))

vi.mock("@/components/ui/calendar", () => ({
  Calendar: () => <div />,
}))

vi.mock("@/components/ui/toast", () => ({
  toast: { add: vi.fn() },
}))

describe("Tabela de reservas", () => {
  beforeEach(() => {
    mocks.useParamsReservations.mockReturnValue({
      date: "2026-10-13T12:00:00.000Z",
      setDate: vi.fn(),
    })
    mocks.useListReservations.mockReturnValue({
      data: [
        {
          id: "my-reservation",
          room: { name: "Sala do usuário" },
        },
      ],
      isError: false,
    })
    mocks.mutateAsync.mockResolvedValue(undefined)
  })

  afterEach(() => cleanup())

  it("exibe as reservas retornadas para o usuário e solicita a exclusão pelo ID", async () => {
    render(<TableReservations />)

    expect(screen.getByText("Sala do usuário")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Excluir Sala do usuário" }))

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith("my-reservation")
    })
  })

  it("exibe estado vazio quando não há reservas próprias", () => {
    mocks.useListReservations.mockReturnValue({ data: [], isError: false })

    render(<TableReservations />)

    expect(screen.getByText("Nenhuma reserva encontrada")).toBeTruthy()
  })
})
