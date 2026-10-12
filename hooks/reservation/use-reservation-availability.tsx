import { useQuery } from "@tanstack/react-query"

export interface AvailableInterval {
  startAt: string
  endAt: string
}

interface UseReservationAvailabilityParams {
  roomId: string
  date: string
}

export const useReservationAvailability = ({
  roomId,
  date,
}: UseReservationAvailabilityParams) => {
  return useQuery({
    queryKey: ["reservation-availability", roomId, date],
    enabled: Boolean(roomId && date),
    queryFn: async ({ signal }) => {
      const startAt = new Date(`${date}T00:00:00`)
      const endAt = new Date(`${date}T23:59:59`)

      if (
        !Number.isFinite(startAt.getTime()) ||
        !Number.isFinite(endAt.getTime())
      ) {
        throw new Error("Data inválida para consultar disponibilidade.")
      }

      const searchParams = new URLSearchParams({
        roomId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      })
      const response = await fetch(
        `/api/reservations/availability?${searchParams}`,
        {
          signal,
        }
      )

      let result: AvailableInterval[] | { error?: string }
      try {
        result = (await response.json()) as
          AvailableInterval[] | { error?: string }
      } catch {
        throw new Error("O servidor retornou uma resposta inválida.")
      }

      if (!response.ok) {
        throw new Error(
          !Array.isArray(result)
            ? (result.error ?? "Não foi possível consultar disponibilidade.")
            : "Não foi possível consultar disponibilidade."
        )
      }

      if (!Array.isArray(result)) {
        throw new Error("O servidor retornou uma disponibilidade inválida.")
      }

      return result
    },
  })
}
