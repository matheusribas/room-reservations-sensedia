import { NextResponse } from "next/server"
import { z } from "zod"

export function invalidRequest(error: z.ZodError | string) {
  let message: string
  if (typeof error === "string") {
    message = error
  } else {
    message = error.issues[0]?.message ?? "Dados inválidos."
  }

  return NextResponse.json({ error: message }, { status: 400 })
}
