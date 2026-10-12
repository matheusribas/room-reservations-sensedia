import { buttonVariants } from "@/components/ui/button"
import { TableReservations } from "./_components/table-reservation"
import Link from "next/link"
import { SquareArrowOutUpRightIcon } from "lucide-react"

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
          href="/create-reservation"
          className={buttonVariants({ size: "lg" })}
        >
          Criar reserva <SquareArrowOutUpRightIcon />
        </Link>
      </div>

      <TableReservations />
    </>
  )
}
