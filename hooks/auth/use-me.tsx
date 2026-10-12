import { User } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { throwIfNotOk } from "@/lib/api-error"

export const useMe = (enabled = true) => {
  return useQuery({
    queryKey: ["me"],
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
    queryFn: async ({ signal }): Promise<User | null> => {
      const response = await fetch("/api/auth/me", { signal })

      if (response.status === 401) return null

      await throwIfNotOk(response, "Falha ao buscar usuário autenticado.")

      const result = (await response.json()) as { user: User }
      return result.user
    },
  })
}
