import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const resources = await prisma.resource.findMany()

  return NextResponse.json(resources, { status: 200 })
}
