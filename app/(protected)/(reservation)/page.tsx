import { buttonVariants } from "@/components/ui/button"
import { TableReservations } from "./_components/table-reservation"
import Link from "next/link"
import { CalendarDaysIcon } from "lucide-react"
import { Suspense } from "react"

export default function ReservationPage() {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl">Minhas reservas</h2>
          <p className="text-muted-foreground">
            Aqui você pode visualizar suas reservas.
          </p>
        </div>
        <Link
          href="/reservation/create"
          className={buttonVariants({ size: "lg" })}
        >
          <CalendarDaysIcon /> Criar reserva
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
            Carregando tabela...
          </div>
        }
      >
        <TableReservations />
      </Suspense>
    </>
  )
}
