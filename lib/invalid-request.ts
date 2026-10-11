import { NextResponse } from "next/server"
import { z } from "zod"

export function invalidRequest(error: z.ZodError) {
  return NextResponse.json(
    { error: error.issues[0]?.message ?? "Dados inválidos." },
    { status: 400 }
  )
}
