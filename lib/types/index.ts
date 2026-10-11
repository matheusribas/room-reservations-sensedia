export type Resource = { id: string; name: string }
export type Room = {
  id: string
  name: string
  capacity: number
  resources: Resource[]
}
