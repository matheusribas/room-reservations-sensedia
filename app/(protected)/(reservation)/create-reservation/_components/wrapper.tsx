"use client"

import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useListRooms } from "@/hooks/rooms/use-list-rooms"
import { SaveIcon, SquareArrowOutUpRightIcon } from "lucide-react"
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  reservationFormSchema,
  type CreateReservationInput,
  type ReservationFormValues,
} from "@/lib/schemas/reservations"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, getHours } from "date-fns"
import { useCreateReservation } from "@/hooks/reservation/use-create-reservation"
import { useEffect } from "react"
import { toast } from "@/components/ui/toast"
import { AvailabilityHour } from "./availability-hour"
import { useQueryClient } from "@tanstack/react-query"

function localDateString(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export function Wrapper() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get("roomId") || ""
  const { data: rooms } = useListRooms({ capacity: "", resourceIds: [] })
  const mutateCreateReservation = useCreateReservation()
  const isSuccess = mutateCreateReservation.isSuccess
  const queryClient = useQueryClient()

  const form = useForm<ReservationFormValues, unknown, CreateReservationInput>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      roomId,
      userId: "cmv41binp0005356tnsf9w0pn", // TODO: retirar mock
      date: localDateString(new Date()),
      start: `${getHours(new Date()) + 1}:00`,
      end: `${getHours(new Date()) + 2}:00`,
    },
  })
  const selectedRoomId = useWatch({ control: form.control, name: "roomId" })
  const selectedRoom = rooms?.find((room) => room.id === selectedRoomId)

  async function handleSubmit(values: CreateReservationInput) {
    form.clearErrors("root.server")
    try {
      await mutateCreateReservation.mutateAsync(values)
      queryClient.invalidateQueries({
        queryKey: ["reservation-availability", roomId, form.getValues("date")],
      })
    } catch (error) {
      form.setError("root.server", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível conectar ao servidor. Tente novamente.",
      })
    }
  }

  useEffect(() => {
    const setupToast = { message: "", type: "info" }

    if (form.formState.errors.root?.server?.message) {
      setupToast.message = form.formState.errors.root?.server?.message
      setupToast.type = "error"
    } else if (isSuccess) {
      setupToast.message = "Reserva criada com sucesso."
      setupToast.type = "success"
    }

    if (form.formState.errors.root?.server?.message || isSuccess) {
      toast.add({
        type: setupToast.type,
        title: setupToast.message,
      })
    }
  }, [form.formState.errors.root?.server?.message, isSuccess])

  if (rooms !== undefined && rooms.length === 0) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-4">
        <p role="alert">Nenhuma sala está cadastrada.</p>
        <Link href={`/rooms`} className={buttonVariants()}>
          Voltar para salas <SquareArrowOutUpRightIcon />
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl">Criando reserva</h2>
          <p className="text-muted-foreground">
            Preencha o formulário para reservar a sala.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href={`/rooms`}
            className={buttonVariants({
              variant: "outline",
              size: "lg",
            })}
          >
            Cancelar
          </Link>
          <Button
            size="lg"
            type="submit"
            form="reservation-form"
            disabled={form.formState.isSubmitting}
          >
            <SaveIcon />
            {form.formState.isSubmitting ? "Salvando..." : "Salvar reserva"}
          </Button>
        </div>
      </div>
      <FormProvider {...form}>
        <Card>
          <CardHeader>
            <CardTitle>Reservando: {selectedRoom?.name}</CardTitle>
            <CardDescription>
              Capacidade de {selectedRoom?.capacity}{" "}
              {selectedRoom?.capacity === 1 ? "pessoa" : "pessoas"}{" "}
              {selectedRoom !== undefined &&
                !!selectedRoom.resources.length && (
                  <>
                    {" "}
                    - Recursos:{" "}
                    <span className="capitalize">
                      {selectedRoom.resources
                        .slice(0, 3)
                        .map((resource) => resource.name)
                        .join(", ")}{" "}
                      {selectedRoom.resources.length > 3 &&
                        `+ ${selectedRoom.resources.length - 3}`}
                    </span>
                  </>
                )}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6">
            <AvailabilityHour />
            <form
              id="reservation-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              noValidate
            >
              <FieldSet>
                <FieldGroup>
                  <Controller
                    control={form.control}
                    name="roomId"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.error}>
                        <FieldLabel htmlFor="reservation-room">Sala</FieldLabel>
                        <Select
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="reservation-room"
                            ref={field.ref}
                            onBlur={field.onBlur}
                            aria-invalid={fieldState.invalid}
                            className="w-full"
                          >
                            <SelectValue
                              placeholder="Selecione uma sala"
                              render={<span>{selectedRoom?.name || ""}</span>}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {rooms?.map((room) => (
                              <SelectItem key={room.id} value={room.id}>
                                {room.name} - {room.capacity} pessoas
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.error && (
                          <FieldError>{fieldState.error.message}</FieldError>
                        )}
                      </Field>
                    )}
                  />

                  <FieldGroup className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <Controller
                      control={form.control}
                      name="date"
                      render={({ field, fieldState }) => {
                        const selectedDate = field.value
                          ? new Date(`${field.value}T12:00:00`)
                          : undefined

                        return (
                          <Field data-invalid={fieldState.error}>
                            <FieldLabel htmlFor="date-picker-date">
                              Data
                            </FieldLabel>
                            <Popover>
                              <PopoverTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="outline"
                                    id="date-picker-date"
                                    aria-invalid={fieldState.invalid}
                                    className="justify-start font-normal"
                                  >
                                    {selectedDate ? (
                                      format(selectedDate, "dd/MM/yyyy")
                                    ) : (
                                      <span>Selecione a data</span>
                                    )}
                                  </Button>
                                }
                              />
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={(value) =>
                                    field.onChange(
                                      value ? localDateString(value) : ""
                                    )
                                  }
                                  disabled={{
                                    before: new Date(
                                      `${localDateString(new Date())}T00:00:00`
                                    ),
                                  }}
                                  defaultMonth={selectedDate}
                                />
                              </PopoverContent>
                            </Popover>
                            {fieldState.error && (
                              <FieldError>
                                {fieldState.error.message}
                              </FieldError>
                            )}
                          </Field>
                        )
                      }}
                    />

                    <Field data-invalid={form.formState.errors.start}>
                      <FieldLabel htmlFor="time-picker-start">
                        Início
                      </FieldLabel>
                      <Input
                        type="time"
                        id="time-picker-start"
                        step="60"
                        aria-invalid={Boolean(form.formState.errors.start)}
                        {...form.register("start")}
                      />
                      {form.formState.errors.start && (
                        <FieldError>
                          {form.formState.errors.start.message}
                        </FieldError>
                      )}
                    </Field>

                    <Field data-invalid={form.formState.errors.end}>
                      <FieldLabel htmlFor="time-picker-end">Fim</FieldLabel>
                      <Input
                        type="time"
                        id="time-picker-end"
                        step="60"
                        aria-invalid={Boolean(form.formState.errors.end)}
                        {...form.register("end")}
                      />
                      {form.formState.errors.end && (
                        <FieldError>
                          {form.formState.errors.end.message}
                        </FieldError>
                      )}
                    </Field>
                  </FieldGroup>
                </FieldGroup>
              </FieldSet>
            </form>
          </CardContent>
        </Card>
      </FormProvider>
    </>
  )
}
