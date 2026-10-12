import { Room } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { throwIfNotOk } from "@/lib/api-error"

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
      await throwIfNotOk(response, "Falha ao buscar salas.")

      return (await response.json()) as Room[]
    },
  })
}
