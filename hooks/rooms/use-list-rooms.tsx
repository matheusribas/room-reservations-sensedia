import { Room } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"

interface UseListRoomsParams {
  capacity: string
  resourceIds: string[]
}
export const useListRooms = ({ capacity, resourceIds }: UseListRoomsParams) => {
  return useQuery({
    queryKey: ["rooms", capacity, resourceIds],
    queryFn: async ({ signal }) => {
      const searchParams = new URLSearchParams()

      if (capacity) searchParams.set("capacity", capacity)
      if (resourceIds.length > 0) {
        searchParams.set("resourcesIds", JSON.stringify(resourceIds))
      }

      const response = await fetch(`/api/rooms?${searchParams}`, { signal })
      if (!response.ok) throw new Error("Falha ao buscar salas.")

      return (await response.json()) as Room[]
    },
  })
}
