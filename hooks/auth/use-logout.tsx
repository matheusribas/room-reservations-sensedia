import { useMutation } from "@tanstack/react-query"
import { throwIfNotOk } from "@/lib/api-error"

export const useLogout = () => {
  return useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      await throwIfNotOk(response, "Falha ao sair da aplicação.")

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
