import { useMutation } from "@tanstack/react-query"

export const useDeleteReservation = () => {
  return useMutation({
    mutationKey: ["delete-reservation"],
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const result: unknown = await response.json().catch(() => null)
        let errorMessage = "Falha ao excluir reserva."

        if (
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
        ) {
          errorMessage = result.error
        }

        throw new Error(errorMessage)
      }
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
