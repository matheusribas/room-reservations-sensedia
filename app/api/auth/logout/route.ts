import { createHash } from "node:crypto"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (token) {
    const tokenHash = createHash("sha256").update(token).digest("hex")

    await prisma.session.deleteMany({
      where: { tokenHash },
    })
  }

  const response = NextResponse.json({
    message: "Logout realizado com sucesso",
  })

  response.cookies.delete("session")

  return response
}
