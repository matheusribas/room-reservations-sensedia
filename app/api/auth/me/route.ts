import { NextResponse } from "next/server"
import { getCurrentUser, MESSAGE_UNAUTHENTICATED } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    const response = NextResponse.json(
      { error: MESSAGE_UNAUTHENTICATED },
      { status: 401 }
    )

    response.cookies.delete("session")
    return response
  }

  return NextResponse.json({ user })
}
