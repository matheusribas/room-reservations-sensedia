import assert from "node:assert/strict"
import { test } from "node:test"

import {
  createReservationSchema,
  isReservationBusinessDay,
  reservationBusinessHoursSchema,
  reservationFormSchema,
  reservationLocalDateTimeToDate,
} from "../lib/schemas/reservations"

function nextBusinessDate() {
  const date = new Date()
  date.setUTCHours(12, 0, 0, 0)

  do {
    date.setUTCDate(date.getUTCDate() + 1)
  } while (!isReservationBusinessDay(date.toISOString().slice(0, 10)))

  return date.toISOString().slice(0, 10)
}

function nextSaturday() {
  const date = new Date()
  date.setUTCHours(12, 0, 0, 0)

  while (date.getUTCDay() !== 6) {
    date.setUTCDate(date.getUTCDate() + 1)
  }

  return date.toISOString().slice(0, 10)
}

function isApiReservationValid(body: unknown) {
  return (
    reservationBusinessHoursSchema.safeParse(body).success &&
    createReservationSchema.safeParse(body).success
  )
}

function isApiReservationValidAt(date: string, start: string, end: string) {
  return isApiReservationValid({
    roomId: "test-room",
    startAt: reservationLocalDateTimeToDate(date, start).toISOString(),
    endAt: reservationLocalDateTimeToDate(date, end).toISOString(),
  })
}

test("accepts weekday reservations within 08:00-20:00", () => {
  const date = nextBusinessDate()

  assert.equal(isApiReservationValidAt(date, "08:00", "09:00"), true)
  assert.equal(isApiReservationValidAt(date, "19:45", "20:00"), true)
})

test("rejects weekend reservations", () => {
  const date = nextSaturday()

  assert.equal(isApiReservationValidAt(date, "10:00", "11:00"), false)
})

test("rejects reservations outside business hours and across days", () => {
  const weekday = nextBusinessDate()

  assert.equal(isApiReservationValidAt(weekday, "07:45", "08:15"), false)
  assert.equal(isApiReservationValidAt(weekday, "19:45", "20:15"), false)

  const friday = new Date(`${weekday}T12:00:00.000Z`)
  while (friday.getUTCDay() !== 5) {
    friday.setUTCDate(friday.getUTCDate() + 1)
  }
  const saturday = new Date(friday)
  saturday.setUTCDate(saturday.getUTCDate() + 1)

  const startAt = reservationLocalDateTimeToDate(
    friday.toISOString().slice(0, 10),
    "19:45"
  )
  const endAt = reservationLocalDateTimeToDate(
    saturday.toISOString().slice(0, 10),
    "08:00"
  )

  assert.equal(
    isApiReservationValid({
      roomId: "test-room",
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    }),
    false
  )
})

test("rejects invalid timestamps without throwing", () => {
  assert.equal(
    reservationBusinessHoursSchema.safeParse({
      startAt: "invalid",
      endAt: "invalid",
    }).success,
    false
  )
})

test("validates business days and hours in the reservation form", () => {
  const weekday = nextBusinessDate()
  const saturday = nextSaturday()

  assert.equal(
    reservationFormSchema.safeParse({
      roomId: "test-room",
      date: weekday,
      start: "08:00",
      end: "09:00",
      maxDuration: 240,
    }).success,
    true
  )
  assert.equal(
    reservationFormSchema.safeParse({
      roomId: "test-room",
      date: saturday,
      start: "08:00",
      end: "09:00",
      maxDuration: 240,
    }).success,
    false
  )
  assert.equal(
    reservationFormSchema.safeParse({
      roomId: "test-room",
      date: weekday,
      start: "07:00",
      end: "08:00",
      maxDuration: 240,
    }).success,
    false
  )
})
