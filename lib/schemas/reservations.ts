import { z } from "zod"

export const reservationDateTimeSchema = z.iso.datetime({ offset: true })

function validateReservationWindow(
  startAt: Date,
  endAt: Date,
  context: z.RefinementCtx,
  startPath: string,
  endPath: string
) {
  if (startAt.getTime() <= Date.now()) {
    context.addIssue({
      code: "custom",
      path: [startPath],
      message: "A reserva deve começar no futuro.",
    })
  }

  const duration = endAt.getTime() - startAt.getTime()
  if (duration < 15 * 60_000 || duration > 4 * 60 * 60_000) {
    context.addIssue({
      code: "custom",
      path: [endPath],
      message: "A duração deve ser entre 15 minutos à 4 horas.",
    })
  }
}

export const createReservationSchema = z
  .object({
    roomId: z.string().trim().min(1, "Escolha uma sala."),
    userId: z.string().trim().min(1, "Escolha um usuário."),
    startAt: reservationDateTimeSchema,
    endAt: reservationDateTimeSchema,
  })
  .superRefine(({ startAt, endAt }, context) => {
    validateReservationWindow(
      new Date(startAt),
      new Date(endAt),
      context,
      "startAt",
      "endAt"
    )
  })

export type CreateReservationInput = z.infer<typeof createReservationSchema>

export const reservationAvailabilityQuerySchema = z
  .object({
    roomId: z.string().trim().min(1, "Escolha uma sala."),
    startAt: reservationDateTimeSchema,
    endAt: reservationDateTimeSchema,
  })
  .refine(({ startAt, endAt }) => Date.parse(endAt) > Date.parse(startAt), {
    path: ["endAt"],
    message: "O fim do período deve ser posterior ao início.",
  })
  .refine(
    ({ startAt, endAt }) =>
      Date.parse(endAt) - Date.parse(startAt) <= 26 * 60 * 60_000,
    {
      path: ["endAt"],
      message: "Consulte a disponibilidade de no máximo um dia.",
    }
  )

const reservationFormFieldsSchema = z.object({
  roomId: z.string().trim().min(1, "Escolha uma sala."),
  userId: z.string().trim().min(1, "Escolha um usuário."),
  date: z.iso.date("Escolha uma data válida."),
  start: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Informe o início."),
  end: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Informe o fim."),
})

export const reservationFormSchema = reservationFormFieldsSchema
  .superRefine(({ date, start, end }, context) => {
    const startAt = new Date(`${date}T${start}:00`)
    const endAt = new Date(`${date}T${end}:00`)

    if (
      !Number.isFinite(startAt.getTime()) ||
      !Number.isFinite(endAt.getTime())
    ) {
      return
    }

    validateReservationWindow(startAt, endAt, context, "start", "end")
  })
  .transform(({ roomId, userId, date, start, end }) => ({
    roomId,
    userId,
    startAt: new Date(`${date}T${start}:00`).toISOString(),
    endAt: new Date(`${date}T${end}:00`).toISOString(),
  }))

export type ReservationFormValues = z.input<typeof reservationFormSchema>
