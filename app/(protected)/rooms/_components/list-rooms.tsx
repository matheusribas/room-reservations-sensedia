"use client"

import { InputDebounce } from "@/components/shared/input-debounce"
import { useListRooms } from "@/hooks/rooms/use-list-rooms"
import { Room } from "@/lib/types"
import { useParamsRooms } from "../_hooks/use-params-rooms"
import { ComboboxResources } from "./combobox-resources"
import { ItemRoom } from "./item-room"
import { SkeletonListRooms } from "./skeleton-list-rooms"

function RoomResults({
  rooms,
  isLoading,
  isError,
}: {
  rooms: Room[]
  isLoading: boolean
  isError: boolean
}) {
  if (isLoading) return <SkeletonListRooms />

  if (isError) {
    return (
      <div className="flex h-100 w-full flex-col items-center justify-center gap-1">
        <p role="alert">Não foi possível carregar as salas.</p>
        <p role="alert" className="text-sm text-muted-foreground">
          Por favor, tente novamente em instants.
        </p>
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="flex h-100 w-full items-center justify-center">
        <p className="text-muted-foreground">Nenhuma sala encontrada</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {rooms.map((room) => (
        <ItemRoom key={room.id} {...room} />
      ))}
    </div>
  )
}

export function ListRooms() {
  const { capacity, resourceIds, setCapacity, setResourceIds } =
    useParamsRooms()
  const {
    data: rooms = [],
    isPending: isLoading,
    isError,
  } = useListRooms({ capacity, resourceIds })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end gap-4">
        <InputDebounce
          value={capacity}
          onValueChange={(newValue) => {
            const value = newValue.replace(/\D/g, "").replace(/^0+/, "")
            setCapacity(value)
          }}
          placeholder="Buscar por capacidade"
          className="w-full max-w-50"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
        />
        <ComboboxResources
          selectedResourceIds={resourceIds}
          onValueChange={setResourceIds}
        />
      </div>

      <div aria-live="polite">
        <RoomResults rooms={rooms} isLoading={isLoading} isError={isError} />
      </div>
    </div>
  )
}
