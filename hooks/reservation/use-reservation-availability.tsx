import { useQuery } from "@tanstack/react-query"
import { throwIfNotOk } from "@/lib/api-error"
import { reservationLocalDateTimeToDate } from "@/lib/schemas/reservations"

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
      const startAt = reservationLocalDateTimeToDate(date, "08:00")
      const endAt = reservationLocalDateTimeToDate(date, "20:00")

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

      await throwIfNotOk(
        response,
        "Não foi possível consultar disponibilidade."
      )

      let result: unknown
      try {
        result = await response.json()
      } catch {
        throw new Error("O servidor retornou uma resposta inválida.")
      }

      if (!Array.isArray(result)) {
        throw new Error("O servidor retornou uma disponibilidade inválida.")
      }

      return result as AvailableInterval[]
    },
  })
}
