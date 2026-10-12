import { useMutation } from "@tanstack/react-query"
import { throwIfNotOk } from "@/lib/api-error"

export const useLogin = () => {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (userId: string) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      await throwIfNotOk(response, "Falha ao acessa aplicação.")

      let result: { error?: string }
      try {
        result = (await response.json()) as { error?: string }
      } catch {
        throw new Error("O servidor retornou uma resposta inválida.")
      }

      return result
    },
  })
}
