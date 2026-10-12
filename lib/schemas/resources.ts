import { z } from "zod"

export const roomsIdsSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value
    try {
      return JSON.parse(value) as unknown
    } catch {
      return value
    }
  },
  z.array(z.string(), { error: "roomsIds deve ser um array de ids." })
)

const resourceFieldsSchema = {
  name: z.string().trim().min(1, "name é obrigatório."),
  roomsIds: roomsIdsSchema.optional(),
}

export const createResourcesSchema = z.object(resourceFieldsSchema)
