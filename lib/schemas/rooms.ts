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

const roomFieldsSchema = {
  name: z.string().trim().min(1, "name é obrigatório."),
  capacity: capacitySchema,
  resourcesIds: resourcesSchema.optional(),
}

export const createRoomSchema = z.object(roomFieldsSchema)

export const updateRoomSchema = z
  .object({
    name: roomFieldsSchema.name.optional(),
    capacity: roomFieldsSchema.capacity.optional(),
    resourcesIds: roomFieldsSchema.resourcesIds.optional(),
  })
  .refine(
    ({ name, capacity, resourcesIds }) =>
      name !== undefined ||
      capacity !== undefined ||
      resourcesIds !== undefined,
    "Informe ao menos um campo válido para atualizar: { name: string, capacity: number, resourcesIds: string[] }"
  )
