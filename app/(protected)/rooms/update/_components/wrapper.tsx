"use client"

import { useRouter } from "next/navigation"
import { type RoomFormValues } from "@/lib/schemas/rooms"
import { toast } from "@/components/ui/toast"
import { FormRoom } from "../../_components/form-room"
import { useUpdateRoom } from "@/hooks/rooms/use-update-room"

interface WrapperProps {
  roomId: string
  defaultValues: RoomFormValues
}
export function Wrapper({ roomId, defaultValues }: WrapperProps) {
  const router = useRouter()
  const mutateUpdateRoom = useUpdateRoom()
  const isSubmitting = mutateUpdateRoom.isPending

  function handleSubmit(values: RoomFormValues) {
    mutateUpdateRoom.mutateAsync({ id: roomId, ...values }).then(
      () => {
        toast.add({
          type: "success",
          title: "Sala alterada com sucesso!",
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
      isCreating={false}
      defaultValues={defaultValues}
    />
  )
}
