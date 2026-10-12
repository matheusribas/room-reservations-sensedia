import { NextResponse } from "next/server"
import { getCurrentUser, MESSAGE_UNAUTHENTICATED } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { error: MESSAGE_UNAUTHENTICATED },
      { status: 401 }
    )
  }

  return NextResponse.json({ user })
}
