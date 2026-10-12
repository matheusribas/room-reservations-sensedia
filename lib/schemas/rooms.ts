import { z } from "zod"

export const capacityQuerySchema = z.coerce
  .number()
  .int()
  .positive("capacity deve ser um número inteiro maior que 0.")

export const capacitySchema = z
  .number()
  .int()
  .positive("capacity deve ser um número inteiro maior que 0.")

export const resourcesSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value
    try {
      return JSON.parse(value) as unknown
    } catch {
      return value
    }
  },
  z.array(z.string(), { error: "resources deve ser um array de ids." })
)

export const newResourcesSchema = z
  .array(
    z.string().trim().toLowerCase().min(1, "Nome do recurso é obrigatório.")
  )
  .optional()

const roomFieldsSchema = {
  name: z.string().trim().min(1, "name é obrigatório."),
  capacity: capacitySchema,
  resourcesIds: resourcesSchema.optional(),
  newResources: newResourcesSchema,
}

export const createRoomSchema = z.object(roomFieldsSchema)

export const updateRoomSchema = z
  .object({
    name: roomFieldsSchema.name.optional(),
    capacity: roomFieldsSchema.capacity.optional(),
    resourcesIds: roomFieldsSchema.resourcesIds.optional(),
    newResources: roomFieldsSchema.newResources,
  })
  .refine(
    ({ name, capacity, resourcesIds, newResources }) =>
      name !== undefined ||
      capacity !== undefined ||
      resourcesIds !== undefined ||
      newResources !== undefined,
    "Informe ao menos um campo válido para atualizar: { name: string, capacity: number, resourcesIds: string[] }"
  )

export const roomFormFieldsSchema = z.object({
  name: z.string().trim().min(1, "name é obrigatório."),
  capacity: z.number().int().min(1, "Capacidade de no mínimo 1 pessoa"),
  resourcesIds: z
    .array(z.string(), { error: "resources deve ser um array de ids." })
    .optional(),
  newResources: newResourcesSchema,
})

export type RoomFormValues = z.input<typeof roomFormFieldsSchema>
export type UpdateRoomValues = z.input<typeof updateRoomSchema> & { id: string }
