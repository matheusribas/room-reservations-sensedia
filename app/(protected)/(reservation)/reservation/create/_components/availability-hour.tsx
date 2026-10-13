"use client"

import { FieldDescription } from "@/components/ui/field"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import {
  AvailableInterval,
  useReservationAvailability,
} from "@/hooks/reservation/use-reservation-availability"
import {
  CreateReservationInput,
  ReservationFormValues,
} from "@/lib/schemas/reservations"
import { format } from "date-fns"
import { useFormContext, useWatch } from "react-hook-form"

interface AvailabilityResultsProps {
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  availability?: AvailableInterval[]
  hasRoom: boolean
}

function AvailabilityResults({
  isLoading,
  isError,
  errorMessage,
  availability,
  hasRoom,
}: AvailabilityResultsProps) {
  if (!hasRoom) {
    return (
      <p className="text-sm text-muted-foreground">Selecione uma sala para consultar os horários.</p>
    )
  } else if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Consultando horários...</p>
    )
  } else if (isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {errorMessage}
      </p>
    )
  } else if (!availability?.length) {
    return (
      <FieldDescription>
        Não há intervalos disponíveis de pelo menos 15 minutos.
      </FieldDescription>
    )
  }

  return (
    <div className="flex gap-2">
      {availability.map((interval) => {
        const intervalStart = new Date(interval.startAt)
        const intervalEnd = new Date(interval.endAt)

        return (
          <div
            key={interval.startAt}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
          >
            <p className="flex gap-1.5 text-sm">
              <span className="font-medium">
                {format(intervalStart, "HH:mm")}
              </span>
              <span className="flex gap-4 font-medium">às</span>
              <span className="flex gap-4 font-medium">
                {format(intervalEnd, "HH:mm")}
              </span>
            </p>
          </div>
        )
      })}
    </div>
  )
}

export function AvailabilityHour() {
  const { control } = useFormContext<
    ReservationFormValues,
    unknown,
    CreateReservationInput
  >()
  const selectedRoomId = useWatch({ control, name: "roomId" })
  const selectedDate = useWatch({ control, name: "date" })
  const maxDuration = useWatch({ control, name: "maxDuration" })

  const { isLoading, isError, error, data } = useReservationAvailability({
    roomId: selectedRoomId,
    date: selectedDate,
  })

  console.log({ selectedDate})
  return (
    <Item variant="outline">
      <ItemContent className="gap-3">
        <ItemTitle>Períodos disponíveis para esta sala</ItemTitle>
        <AvailabilityResults
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message}
          availability={data}
          hasRoom={!!selectedRoomId}
        />
        <ItemDescription>
          Reservas são permitidas de segunda a sexta, das 08h às 20h. <br />
          Uma reserva deve ter no mínimo 15 minutos e no máximo {
            maxDuration
          }{" "}
          minutos para esta sala.
        </ItemDescription>
      </ItemContent>
    </Item>
  )
}
