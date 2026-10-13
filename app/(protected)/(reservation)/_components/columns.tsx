"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { format, isWithinInterval } from "date-fns"
import { DataTableFeaturesType } from "@/components/shared/data-table/data-table-features"
import { Reservation } from "@/lib/types"
import { TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

const columnHelper = createColumnHelper<DataTableFeaturesType, Reservation>()

interface ColumnsParams {
  onDelete: (id: string) => void
}
export const columns = ({ onDelete }: ColumnsParams) =>
  columnHelper.columns([
    columnHelper.accessor("room.name", {
      header: "Sala",
      cell({ row }) {
        const { room } = row.original
        return <p className="max-w-2xs truncate">{room.name}</p>
      },
    }),
    columnHelper.accessor("room.capacity", {
      header: "Capacidade",
      cell({ row }) {
        const { room } = row.original
        return (
          <Badge>
            {room.capacity} {room.capacity === 1 ? "pessoa" : "pessoas"}
          </Badge>
        )
      },
    }),
    columnHelper.accessor("room.resources", {
      header: "Recursos",
      cell({ row }) {
        const { room } = row.original
        const resources = room?.resources || []

        if (!resources.length) {
          return "Sem recurso"
        }

        const SLICE_INDEX = 2
        const rest = resources.slice(SLICE_INDEX) || []

        return (
          <Tooltip disabled={!rest.length}>
            <TooltipTrigger
              render={
                <div className="space-x-2">
                  {resources.slice(0, SLICE_INDEX).map((resource) => (
                    <Badge key={resource.id} className="capitalize" variant='outline'>
                      {resource.name}
                    </Badge>
                  ))}
                  {rest.length ? <span>+{rest.length}</span> : null}
                </div>
              }
            />
            <TooltipContent>
              {resources.map((r) => r.name).join(", ")}
            </TooltipContent>
          </Tooltip>
        )
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Data",
      cell({ row }) {
        const { startAt } = row.original
        let content = "--"

        if (startAt) {
          content = format(new Date(startAt), "dd/MM/yyyy")
        }

        return <p>{content}</p>
      },
    }),
    columnHelper.accessor("startAt", {
      header: "Início",
      cell({ row }) {
        const { startAt } = row.original
        let content = "--"

        if (startAt) {
          content = format(new Date(startAt), "HH:mm")
        }

        return <p>{content}</p>
      },
    }),
    columnHelper.accessor("endAt", {
      header: "Fim",
      cell({ row }) {
        const { endAt } = row.original
        let content = "--"

        if (endAt) {
          content = format(new Date(endAt), "HH:mm")
        }

        return <p>{content}</p>
      },
    }),
    columnHelper.display({
      id: "id",
      header() {
        return <div className="text-center">Ação</div>
      },
      cell: ({ row }) => {
        const reservation = row.original
        const now = new Date()
        const isReservationInProgress = isWithinInterval(now, {
          start: reservation.startAt,
          end: reservation.endAt,
        })

        return (
          <div className="flex w-full justify-center gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(reservation.id)}
                    disabled={isReservationInProgress}
                  >
                    <TrashIcon size={16} className="text-destructive" />
                  </Button>
                }
              />
              <TooltipContent>Excluir reservar</TooltipContent>
            </Tooltip>
          </div>
        )
      },
    }),
  ])
