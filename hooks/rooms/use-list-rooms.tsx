import { Room } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"

export const useListRooms = (
  capacity: string,
  selectedResourceIds: string[]
) => {
  return useQuery({
    queryKey: ["rooms", capacity, selectedResourceIds],
    queryFn: async ({ signal }) => {
      const searchParams = new URLSearchParams()

      if (capacity) searchParams.set("capacity", capacity)
      if (selectedResourceIds.length > 0) {
        searchParams.set("resourcesIds", JSON.stringify(selectedResourceIds))
      }

      const response = await fetch(`/api/rooms?${searchParams}`, { signal })
      if (!response.ok) throw new Error("Falha ao buscar salas.")

      return (await response.json()) as Room[]
    },
  })
}
