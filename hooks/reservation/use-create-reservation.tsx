import { CreateReservationInput } from "@/lib/schemas/reservations"
import { useMutation } from "@tanstack/react-query"

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
  })
}
