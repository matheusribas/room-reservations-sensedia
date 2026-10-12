import { Resource } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { throwIfNotOk } from "@/lib/api-error"

export const useListResources = () => {
  return useQuery({
    queryKey: ["resources"],
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/resources", { signal })
      await throwIfNotOk(response, "Falha ao buscar recursos.")

      return (await response.json()) as Resource[]
    },
  })
}
