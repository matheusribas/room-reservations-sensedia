import { invalidRequest } from "@/lib/invalid-request"
import { prisma } from "@/lib/prisma"
import { createResourcesSchema } from "@/lib/schemas/resources"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const resources = await prisma.resource.findMany()

  return NextResponse.json(resources, { status: 200 })
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corpo JSON inválido." }, { status: 400 })
  }

  const result = createResourcesSchema.safeParse(body)
  if (!result.success) return invalidRequest(result.error)

  const { name: nameBody, roomsIds } = result.data
  const name = nameBody.toLocaleLowerCase()

  const findWithNameResource = await prisma.resource.findUnique({
    where: { name },
  })
  if (!!findWithNameResource) {
    return NextResponse.json(
      { error: "Já existe um recurso com esse nome." },
      { status: 400 }
    )
  }

  try {
    const resource = await prisma.resource.create({
      data: {
        name,
        ...(roomsIds !== undefined
          ? { rooms: { connect: roomsIds.map((id) => ({ id })) } }
          : {}),
      },
    })
    return NextResponse.json(resource, { status: 201 })
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
      { error: "Não foi possível criar o recurso." },
      { status: 500 }
    )
  }
}
