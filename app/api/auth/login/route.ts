import { createHash, randomBytes } from "node:crypto"
import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const { userId } = await request.json()

  if (typeof userId !== "string" || !userId) {
    return NextResponse.json({ error: "userId inválido" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  })

  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 }
    )
  }

  const token = randomBytes(32).toString("hex")

  const tokenHash = createHash("sha256").update(token).digest("hex")

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)

  await prisma.session.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
    },
  })

  const response = NextResponse.json({ user })

  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })

  return response
}
