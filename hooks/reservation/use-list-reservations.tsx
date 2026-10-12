import { Reservation } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { throwIfNotOk } from "@/lib/api-error"

interface UseReservationParams {
  date: string
}

export const useListReservations = ({ date }: UseReservationParams) => {
  return useQuery({
    queryKey: ["reservation", date],
    enabled: Boolean(date),
    queryFn: async ({ signal }) => {
      const searchParams = new URLSearchParams({ date })
      const response = await fetch(`/api/reservations?${searchParams}`, {
        signal,
      })

      await throwIfNotOk(response, "Falha ao buscar reservas.")

      return (await response.json()) as Reservation[]
    },
  })
}
