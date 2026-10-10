import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const capacityQuerySchema = z.coerce
  .number()
  .int()
  .positive("capacity deve ser um número inteiro positivo.")

const capacitySchema = z
  .number()
  .int()
  .positive("capacity deve ser um número inteiro positivo.")

const resourcesSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value
    try {
      return JSON.parse(value) as unknown
    } catch {
      return value
    }
  },
  z.array(z.string(), { error: "resources deve ser um array de textos." })
)

const roomFieldsSchema = {
  name: z.string().trim().min(1, "name é obrigatório."),
  capacity: capacitySchema,
  resources: resourcesSchema.optional(),
}

const createRoomSchema = z.object(roomFieldsSchema)

const updateRoomSchema = z
  .object({
    id: z.string().trim().min(1, "id inválido."),
    name: roomFieldsSchema.name.optional(),
    capacity: roomFieldsSchema.capacity.optional(),
    resources: roomFieldsSchema.resources,
  })
  .refine(
    ({ name, capacity, resources }) =>
      name !== undefined || capacity !== undefined || resources !== undefined,
    "Informe ao menos um campo para atualizar."
  )

function invalidRequest(error: z.ZodError) {
  return NextResponse.json(
    { error: error.issues[0]?.message ?? "Dados inválidos." },
    { status: 400 }
  )
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const searchParamsCapacity = searchParams.get("capacity")
  const searchParamsResources = searchParams.get("resources")

  let capacity: number | undefined
  if (searchParamsCapacity !== null) {
    const result = capacityQuerySchema.safeParse(searchParamsCapacity)
    if (!result.success) return invalidRequest(result.error)
    capacity = result.data
  }

  let resources: string[] = []
  if (searchParamsResources !== null) {
    const result = resourcesSchema.safeParse(searchParamsResources)
    if (!result.success) return invalidRequest(result.error)
    resources = result.data
  }

  const where = {
    ...(capacity !== undefined ? { capacity: { gte: capacity } } : {}),
    ...(resources.length > 0
      ? {
          AND: resources.map((resource) => ({
            resources: { contains: JSON.stringify(resource) },
          })),
        }
      : {}),
  }

  const rooms = await prisma.room.findMany({ where })

  return NextResponse.json(rooms, { status: 200 })
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corpo JSON inválido." }, { status: 400 })
  }

  const result = createRoomSchema.safeParse(body)
  if (!result.success) return invalidRequest(result.error)

  const { name, capacity, resources } = result.data
  try {
    const room = await prisma.room.create({
      data: {
        name,
        capacity,
        ...(resources !== undefined
          ? { resources: JSON.stringify(resources) }
          : {}),
      },
    })
    return NextResponse.json(room, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar a sala." },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corpo JSON inválido." }, { status: 400 })
  }

  const result = updateRoomSchema.safeParse(body)
  if (!result.success) return invalidRequest(result.error)

  const { id, name, capacity, resources } = result.data
  const data = {
    ...(name !== undefined ? { name } : {}),
    ...(capacity !== undefined ? { capacity } : {}),
    ...(resources !== undefined
      ? { resources: JSON.stringify(resources) }
      : {}),
  }

  try {
    const room = await prisma.room.update({ where: { id }, data })
    return NextResponse.json(room, { status: 200 })
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Sala não encontrada." },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "Não foi possível atualizar a sala." },
      { status: 500 }
    )
  }
}
