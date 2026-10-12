import { CreateReservationInput } from "@/lib/schemas/reservations"
import { useMutation } from "@tanstack/react-query"
import { format } from "date-fns"

export const useCreateReservation = () => {
  return useMutation({
    mutationKey: ["create-reservation"],
    mutationFn: async (values: CreateReservationInput) => {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      let result: { error?: string }
      try {
        result = (await response.json()) as { error?: string }
      } catch {
        throw new Error("O servidor retornou uma resposta inválida.")
      }

      if (!response.ok) {
        throw new Error(result.error ?? "Falha ao criar reserva.")
      }

      return result
    },
    onSuccess(data, variables, onMutateResult, context) {
      const date = format(new Date(variables.startAt), "yyyy-MM-dd")
      context.client.invalidateQueries({
        queryKey: ["reservation-availability", variables.roomId, date],
      })
      context.client.invalidateQueries({
        queryKey: ["reservation", date],
      })
    },
  })
}
