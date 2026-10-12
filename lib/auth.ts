import { createHash } from "node:crypto"
import { cookies } from "next/headers"

import { prisma } from "@/lib/prisma"

export const MESSAGE_UNAUTHENTICATED = "Usuário não autenticado"
export const MESSAGE_UNAUTHORIZED = "Usuário não autorizado"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) return null

  const tokenHash = createHash("sha256").update(token).digest("hex")

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  })

  if (!session) return null

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: { id: session.id },
    })

    return null
  }

  return session.user
}
