import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { invalidRequest } from "@/lib/invalid-request"
import { updateRoomSchema } from "@/lib/schemas/rooms"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id

  if (!id) {
    return NextResponse.json({ error: "Id não informado." }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corpo JSON inválido." }, { status: 400 })
  }

  const result = updateRoomSchema.safeParse(body)
  if (!result.success) return invalidRequest(result.error)

  const name = result.data?.name
  const capacity = result.data?.capacity
  const resourcesIds = result.data?.resourcesIds
  const data = {
    ...(name !== undefined ? { name } : {}),
    ...(capacity !== undefined ? { capacity } : {}),
    ...(resourcesIds !== undefined
      ? { resources: { set: resourcesIds.map((id) => ({ id })) } }
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

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id

  if (!id) {
    return NextResponse.json({ error: "Id não informado." }, { status: 400 })
  }

  try {
    await prisma.room.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
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
      { error: "Não foi possível excluir a sala." },
      { status: 500 }
    )
  }
}
