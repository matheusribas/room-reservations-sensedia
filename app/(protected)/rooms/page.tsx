import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { ListRooms } from "./_components/list-rooms"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { DoorClosedIcon } from "lucide-react"

export default async function RoomPage() {
  const user = await getCurrentUser()

  if (user?.role !== "admin") {
    redirect("/")
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl">Salas</h2>
          <p className="text-muted-foreground">
            Aqui você pode visualizar e reservar uma sala.
          </p>
        </div>
        <Link href="/rooms/create" className={buttonVariants({ size: "lg" })}>
          <DoorClosedIcon /> Criar sala
        </Link>
      </div>

      <Suspense
        fallback={
          <p className="text-muted-foreground">Carregando filtros...</p>
        }
      >
        <ListRooms />
      </Suspense>
    </>
  )
}
