import type { CreateReservationInput } from "../schemas/reservations"

export type Resource = { id: string; name: string }
export type Room = {
  id: string
  name: string
  capacity: number
  maxDuration: number
  resources: Resource[]
}
export type User = {
  id: string
  name: string
  role: "user" | "admin"
  createdAt: Date
}

export type Reservation = {
  id: string
  roomId: string
  room: Room & {
    createdAt: Date
    updatedAt: Date
  }
  userId: string
  startAt: Date
  endAt: Date
  createdAt: Date
}

export type ReservationFormType = CreateReservationInput
