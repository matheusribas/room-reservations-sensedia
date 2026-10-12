import { User } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { throwIfNotOk } from "@/lib/api-error"

export const useListUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/users", { signal })
      await throwIfNotOk(response, "Falha ao buscar usuários.")
      return (await response.json()) as User[]
    },
  })
}
