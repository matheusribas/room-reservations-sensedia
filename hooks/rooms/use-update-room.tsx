import { UpdateRoomValues } from "@/lib/schemas/rooms"
import { useMutation } from "@tanstack/react-query"
import { throwIfNotOk } from "@/lib/api-error"

export const useUpdateRoom = () => {
  return useMutation({
    mutationKey: ["update-room"],
    mutationFn: async ({ id, ...values }: UpdateRoomValues) => {
      const response = await fetch(`/api/rooms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      await throwIfNotOk(response, "Falha ao criar sala.")

      let result: { error?: string }
      try {
        result = (await response.json()) as { error?: string }
      } catch {
        throw new Error("O servidor retornou uma resposta inválida.")
      }

      return result
    },
    onSuccess(data, variables, onMutateResult, context) {
      context.client.invalidateQueries({
        queryKey: ["rooms"],
        exact: false,
      })
    },
  })
}
