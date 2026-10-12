import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { invalidRequest } from "@/lib/invalid-request"
import {
  capacityQuerySchema,
  createRoomSchema,
  resourcesSchema,
} from "@/lib/schemas/rooms"
import {
  getCurrentUser,
  MESSAGE_UNAUTHENTICATED,
  MESSAGE_UNAUTHORIZED,
} from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { error: MESSAGE_UNAUTHENTICATED },
      { status: 401 }
    )
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: MESSAGE_UNAUTHORIZED }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const searchParamsCapacity = searchParams.get("capacity")
  const searchParamsResourcesIds = searchParams.get("resourcesIds")

  let capacity: number | undefined
  if (searchParamsCapacity !== null) {
    const result = capacityQuerySchema.safeParse(searchParamsCapacity)
    if (!result.success) return invalidRequest(result.error)
    capacity = result.data
  }

  let resourcesIds: string[] = []
  if (searchParamsResourcesIds !== null) {
    const result = resourcesSchema.safeParse(searchParamsResourcesIds)
    if (!result.success) return invalidRequest(result.error)
    resourcesIds = result.data
  }

  const where = {
    ...(capacity !== undefined ? { capacity: { gte: capacity } } : {}),
    ...(resourcesIds.length > 0
      ? {
          AND: resourcesIds.map((id) => ({
            resources: { some: { id } },
          })),
        }
      : {}),
  }

  const rooms = await prisma.room.findMany({
    where,
    include: { resources: true },
  })

  return NextResponse.json(rooms, { status: 200 })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { error: MESSAGE_UNAUTHENTICATED },
      { status: 401 }
    )
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: MESSAGE_UNAUTHORIZED }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corpo JSON inválido." }, { status: 400 })
  }

  const result = createRoomSchema.safeParse(body)
  if (!result.success) return invalidRequest(result.error)

  const { name, capacity, resourcesIds } = result.data
  try {
    const room = await prisma.room.create({
      data: {
        name,
        capacity,
        ...(resourcesIds !== undefined
          ? { resources: { connect: resourcesIds.map((id) => ({ id })) } }
          : {}),
      },
    })
    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Recurso não encontrado." },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Não foi possível criar a sala." },
      { status: 500 }
    )
  }
}
