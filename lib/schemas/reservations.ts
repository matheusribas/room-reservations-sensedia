import { z } from "zod"

export const reservationDateTimeSchema = z.iso.datetime({ offset: true })

const reservationTimeZone = "America/Sao_Paulo"
const businessHoursFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: reservationTimeZone,
  weekday: "long",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})
const businessWeekdays = new Set([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
])

function getBusinessTimeParts(date: Date) {
  const parts = Object.fromEntries(
    businessHoursFormatter
      .formatToParts(date)
      .map(({ type, value }) => [type, value])
  )

  return {
    day: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: parts.weekday,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  }
}

export function getReservationBusinessDate(date: Date) {
  return getBusinessTimeParts(date).day
}

export function getReservationBusinessTime(date: Date) {
  const parts = getBusinessTimeParts(date)

  return {
    date: parts.day,
    weekday: parts.weekday,
    minutes: parts.minutes,
  }
}

export function isReservationBusinessDay(date: string) {
  const weekday = new Date(`${date}T12:00:00.000Z`).getUTCDay()
  return weekday !== 0 && weekday !== 6
}

export function reservationLocalDateTimeToDate(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number)
  const [hour, minute] = time.split(":").map(Number)
  const targetWallTime = Date.UTC(year, month - 1, day, hour, minute)
  let instant = new Date(targetWallTime)

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const local = getBusinessTimeParts(instant)
    const [localYear, localMonth, localDay] = local.day.split("-").map(Number)
    const localWallTime = Date.UTC(
      localYear,
      localMonth - 1,
      localDay,
      Math.floor(local.minutes / 60),
      local.minutes % 60
    )

    instant = new Date(instant.getTime() + targetWallTime - localWallTime)
  }

  return instant
}

function validateBusinessHours(
  startAt: Date,
  endAt: Date,
  context: z.RefinementCtx,
  startPath: string,
  endPath: string
) {
  if (
    !Number.isFinite(startAt.getTime()) ||
    !Number.isFinite(endAt.getTime())
  ) {
    return
  }

  const start = getBusinessTimeParts(startAt)
  const end = getBusinessTimeParts(endAt)

  if (!businessWeekdays.has(start.weekday)) {
    context.addIssue({
      code: "custom",
      path: [startPath],
      message: "Reservas só podem ser feitas de segunda a sexta-feira.",
    })
  }

  if (start.day !== end.day) {
    context.addIssue({
      code: "custom",
      path: [endPath],
      message: "A reserva deve terminar no mesmo dia em que começa.",
    })
  }

  if (start.minutes < 8 * 60 || start.minutes >= 20 * 60) {
    context.addIssue({
      code: "custom",
      path: [startPath],
      message: "O início da reserva deve ocorrer entre 08:00 e 20:00.",
    })
  }

  if (end.minutes < 8 * 60 || end.minutes > 20 * 60) {
    context.addIssue({
      code: "custom",
      path: [endPath],
      message: "O fim da reserva deve ocorrer até às 20:00.",
    })
  }
}

function validateFormBusinessHours(
  date: string,
  start: string,
  end: string,
  context: z.RefinementCtx
) {
  const startMinutes = Number(start.slice(0, 2)) * 60 + Number(start.slice(3))
  const endMinutes = Number(end.slice(0, 2)) * 60 + Number(end.slice(3))

  if (!isReservationBusinessDay(date)) {
    context.addIssue({
      code: "custom",
      path: ["date"],
      message: "Reservas só podem ser feitas de segunda a sexta-feira.",
    })
  }

  if (startMinutes < 8 * 60 || startMinutes >= 20 * 60) {
    context.addIssue({
      code: "custom",
      path: ["start"],
      message: "O início da reserva deve ocorrer entre 08:00 e 20:00.",
    })
  }

  if (endMinutes < 8 * 60 || endMinutes > 20 * 60) {
    context.addIssue({
      code: "custom",
      path: ["end"],
      message: "O fim da reserva deve ocorrer até às 20:00.",
    })
  }
}

function validateReservationWindow(
  startAt: Date,
  endAt: Date,
  context: z.RefinementCtx,
  startPath: string,
  endPath: string,
  maxDurationMinutes?: number
) {
  if (startAt.getTime() <= Date.now()) {
    context.addIssue({
      code: "custom",
      path: [startPath],
      message: "A reserva deve começar no futuro.",
    })
  }

  const duration = endAt.getTime() - startAt.getTime()
  if (duration < 15 * 60_000) {
    context.addIssue({
      code: "custom",
      path: [endPath],
      message: "A duração deve ser de pelo menos 15 minutos.",
    })
  }

  if (
    maxDurationMinutes !== undefined &&
    duration > maxDurationMinutes * 60_000
  ) {
    context.addIssue({
      code: "custom",
      path: [endPath],
      message: `A duração máxima para esta sala é de ${maxDurationMinutes} minutos.`,
    })
  }
}

export const createReservationSchema = z
  .object({
    roomId: z.string().trim().min(1, "Escolha uma sala."),
    startAt: reservationDateTimeSchema,
    endAt: reservationDateTimeSchema,
  })
  .superRefine(({ startAt, endAt }, context) => {
    const startDate = new Date(startAt)
    const endDate = new Date(endAt)
    validateReservationWindow(startDate, endDate, context, "startAt", "endAt")
  })

export type CreateReservationInput = z.infer<typeof createReservationSchema>

export const reservationBusinessHoursSchema = z
  .object({
    startAt: reservationDateTimeSchema,
    endAt: reservationDateTimeSchema,
  })
  .superRefine(({ startAt, endAt }, context) => {
    validateBusinessHours(
      new Date(startAt),
      new Date(endAt),
      context,
      "startAt",
      "endAt"
    )
  })

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
  date: z.iso.date("Escolha uma data válida."),
  start: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Informe o início."),
  end: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Informe o fim."),
  maxDuration: z.number().int().min(15),
})

export const reservationFormSchema = reservationFormFieldsSchema
  .superRefine(({ date, start, end, maxDuration }, context) => {
    validateFormBusinessHours(date, start, end, context)

    const startAt = reservationLocalDateTimeToDate(date, start)
    const endAt = reservationLocalDateTimeToDate(date, end)

    if (
      !Number.isFinite(startAt.getTime()) ||
      !Number.isFinite(endAt.getTime())
    ) {
      return
    }

    validateReservationWindow(
      startAt,
      endAt,
      context,
      "start",
      "end",
      maxDuration
    )
  })
  .transform(({ roomId, date, start, end }) => ({
    roomId,
    startAt: reservationLocalDateTimeToDate(date, start).toISOString(),
    endAt: reservationLocalDateTimeToDate(date, end).toISOString(),
  }))

export type ReservationFormValues = z.input<typeof reservationFormSchema>
