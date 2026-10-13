"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { LoaderCircleIcon, SaveIcon } from "lucide-react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { roomFormFieldsSchema, type RoomFormValues } from "@/lib/schemas/rooms"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { UpsetResources } from "./upset-resources"

interface FormRoomProps {
  isSubmitting: boolean
  isCreating: boolean
  onSubmit: (values: RoomFormValues) => void
  defaultValues: RoomFormValues
}

const labels = {
  create: {
    title: "Criando sala",
    description: "Preencha o formulário para criar uma nova sala.",
  },
  update: {
    title: "Editando sala",
    description: "Preencha o formulário para editar a sala.",
  },
} as const

export function FormRoom({
  isSubmitting: isSubmittingMutate,
  isCreating,
  onSubmit,
  defaultValues,
}: FormRoomProps) {
  const router = useRouter()
  const type = isCreating ? "create" : "update"

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormFieldsSchema),
    defaultValues,
  })
  const isSubmitting = form.formState.isSubmitting || isSubmittingMutate

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl">{labels[type].title}</h2>
          <p className="text-muted-foreground">{labels[type].description}</p>
        </div>

        <div className="flex gap-4 flex-col sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            type="button"
            disabled={isSubmitting}
            onClick={() => router.push("/rooms")}
          >
            Cancelar
          </Button>
          <Button
            size="lg"
            type="submit"
            form="room-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <SaveIcon />
            )}
            {isSubmitting ? "Salvando..." : "Salvar sala"}
          </Button>
        </div>
      </div>
      <FormProvider {...form}>
        <Card>
          <CardContent className="grid grid-cols-1 gap-6">
            <form
              id="room-form"
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
            >
              <FieldSet>
                <FieldGroup>
                  <Field data-invalid={form.formState.errors.name}>
                    <FieldLabel htmlFor="name">Nome da sala</FieldLabel>
                    <Input
                      id="name"
                      placeholder="Digite o nome da sala"
                      autoComplete="off"
                      aria-invalid={Boolean(form.formState.errors.name)}
                      {...form.register("name")}
                    />
                    {form.formState.errors.name ? (
                      <FieldError>
                        {form.formState.errors.name.message}
                      </FieldError>
                    ) : (
                      <FieldDescription>
                        Informe um nome para identificar a sala.
                      </FieldDescription>
                    )}
                  </Field>

                  <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field data-invalid={form.formState.errors.capacity}>
                      <FieldLabel htmlFor="capacity">Capacidade</FieldLabel>
                      <Input
                        type="number"
                        id="capacity"
                        inputMode="numeric"
                        min={1}
                        step={1}
                        aria-invalid={Boolean(form.formState.errors.capacity)}
                        {...form.register("capacity", { valueAsNumber: true })}
                      />
                      {form.formState.errors.capacity ? (
                        <FieldError>
                          {form.formState.errors.capacity.message}
                        </FieldError>
                      ) : (
                        <FieldDescription>
                          Preencha a capacidade de pessoas que essa sala
                          comporta
                        </FieldDescription>
                      )}
                    </Field>
                    <Field data-invalid={form.formState.errors.maxDuration}>
                      <FieldLabel htmlFor="maxDuration">
                        Duração máxima (minutos)
                      </FieldLabel>
                      <Input
                        type="number"
                        id="maxDuration"
                        inputMode="numeric"
                        min={15}
                        step={1}
                        aria-invalid={Boolean(
                          form.formState.errors.maxDuration
                        )}
                        {...form.register("maxDuration", {
                          valueAsNumber: true,
                        })}
                      />
                      {form.formState.errors.maxDuration ? (
                        <FieldError>
                          {form.formState.errors.maxDuration.message}
                        </FieldError>
                      ) : (
                        <FieldDescription>
                          Define o tempo máximo de cada reserva nesta sala.
                        </FieldDescription>
                      )}
                    </Field>
                  </FieldGroup>
                  <UpsetResources />
                </FieldGroup>
              </FieldSet>
            </form>
          </CardContent>
        </Card>
      </FormProvider>
    </>
  )
}
