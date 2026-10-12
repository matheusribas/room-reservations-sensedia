import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getCurrentUser,
  MESSAGE_UNAUTHENTICATED,
  MESSAGE_UNAUTHORIZED,
} from "@/lib/auth"

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const id = (await params).id

  if (!id) {
    return NextResponse.json({ error: "Id não informado." }, { status: 400 })
  }

  try {
    await prisma.resource.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Recurso não encontrada." },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Não foi possível excluir o recurso." },
      { status: 500 }
    )
  }
}
