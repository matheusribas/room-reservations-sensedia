"use client"

import { useParamsReservations } from "../_hooks/useParamsReservation"
import { useListReservations } from "@/hooks/reservation/use-list-reservations"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { DataTable } from "@/components/shared/data-table"
import { columns } from "./columns"
import { useDeleteReservation } from "@/hooks/reservation/use-delete-reservation"
import { toast } from "@/components/ui/toast"

export function TableReservations() {
  const { date, setDate } = useParamsReservations()
  const formatedDate = new Date(date)
  const { data: reservations = [], isError } = useListReservations({
    date: format(formatedDate, "yyyy-MM-dd"),
  })
  const mutateDeleteReservation = useDeleteReservation()

  const handleDeleteReservation = async (id: string) => {
    try {
      await mutateDeleteReservation.mutateAsync(id)

      toast.add({
        type: "success",
        title: "Reserva excluída com sucesso!",
      })
    } catch (error) {
      toast.add({
        type: "error",
        title: "Não foi possível excluir a reserva",
        description:
          error instanceof Error
            ? error.message
            : "Por favor, tente novamente em instants",
      })
    }
  }

  const messageFeedback = isError
    ? "Não foi possível carregar as reservas"
    : "Nenhuma reserva encontrada"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <p className="text-muted-foreground">Filtre por data:</p>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                id="date-picker-date"
                className="flex min-w-25 justify-center"
              >
                {formatedDate ? (
                  format(formatedDate, "dd/MM/yyyy")
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formatedDate}
              onSelect={setDate}
              defaultMonth={formatedDate}
            />
          </PopoverContent>
        </Popover>
      </div>

      <DataTable
        columns={columns({ onDelete: handleDeleteReservation })}
        data={reservations}
        isPagination={false}
        isFiltering={false}
        rowCount={reservations.length}
        messageFeedback={messageFeedback}
      />
    </div>
  )
}
