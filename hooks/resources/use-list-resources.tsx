import { Resource } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"

export const useListResources = () => {
  return useQuery({
    queryKey: ["resources"],
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/resources", { signal })
      if (!response.ok) throw new Error("Falha ao buscar recursos.")

      return (await response.json()) as Resource[]
    },
  })
}
