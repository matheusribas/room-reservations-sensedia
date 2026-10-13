import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Wrapper } from "../_components/wrapper"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { DoorClosedIcon } from "lucide-react"

export default async function UpdateRoomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()

  if (user?.role !== "admin") {
    redirect("/")
  }

  const { id: roomId } = await params
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { resources: { select: { id: true } } },
  })

  if (!room) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-4">
        <p role="alert">Ops, essa sala não existe mais.</p>
        <Link href="/rooms" className={buttonVariants()}>
          <DoorClosedIcon /> Voltar para salas
        </Link>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
          Carregando formulário...
        </div>
      }
    >
      <Wrapper
        roomId={room.id}
        defaultValues={{
          name: room.name,
          capacity: room.capacity,
          maxDuration: room.maxDuration,
          resourcesIds: room.resources.map(({ id }) => id),
          newResources: [],
        }}
      />
    </Suspense>
  )
}
