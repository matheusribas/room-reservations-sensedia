import { Suspense } from "react"
import { ListRooms } from "./_components/list-rooms"

export default function RoomPage() {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl">Salas</h2>
          <p className="text-muted-foreground">
            Aqui você pode visualizar e reservar uma sala.
          </p>
        </div>
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
