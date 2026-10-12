"use client"

import { useRouter } from "next/navigation"
import { type RoomFormValues } from "@/lib/schemas/rooms"
import { toast } from "@/components/ui/toast"
import { useCreateRoom } from "@/hooks/rooms/use-create-room"
import { FormRoom } from "../../_components/form-room"

export function Wrapper() {
  const router = useRouter()
  const mutateCreateRoom = useCreateRoom()
  const isSubmitting = mutateCreateRoom.isPending

  function handleSubmit(values: RoomFormValues) {
    mutateCreateRoom.mutateAsync(values).then(
      () => {
        toast.add({
          type: "success",
          title: "Sala criada com sucesso!",
        })
        router.push("/rooms")
      },
      () => undefined
    )
  }

  return (
    <FormRoom
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      isCreating
      defaultValues={{
        capacity: 1,
        name: "",
        resourcesIds: [],
        newResources: [],
      }}
    />
  )
}
