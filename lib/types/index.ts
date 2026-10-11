import type { CreateReservationInput } from "../schemas/reservations"

export type Resource = { id: string; name: string }
export type Room = {
  id: string
  name: string
  capacity: number
  resources: Resource[]
}
export type User = {
  id: string
  name: string
  role: string
  createdAt: Date
}

export type ReservationFormType = CreateReservationInput
