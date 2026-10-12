import { useMutation } from "@tanstack/react-query"
import { throwIfNotOk } from "@/lib/api-error"

export const useDeleteReservation = () => {
  return useMutation({
    mutationKey: ["delete-reservation"],
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      await throwIfNotOk(response, "Falha ao excluir reserva.")
    },
    onSuccess(data, variables, onMutateResult, context) {
      context.client.invalidateQueries({
        queryKey: ["reservation-availability"],
        exact: false,
      })
      context.client.invalidateQueries({
        queryKey: ["reservation"],
        exact: false,
      })
    },
  })
}
