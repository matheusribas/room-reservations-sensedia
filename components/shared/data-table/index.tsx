"use client"

import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { features, type DataTableFeaturesType } from "./data-table-features"
import { DataTablePagination } from "./data-table-pagination"
import { Dispatch, SetStateAction } from "react"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeaturesType, TData>[]
  data: TData[]
  isPagination?: boolean
  pagination?: {
    pageIndex: number
    pageSize: number
  }
  setPagination?: Dispatch<
    SetStateAction<{
      pageIndex: number
      pageSize: number
    }>
  >
  isFiltering?: boolean
  rowCount?: number // Total items in DB
  messageFeedback?: string
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  isPagination,
  pagination,
  setPagination,
  isFiltering,
  rowCount,
  messageFeedback = "Nenhum registro encontrado",
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
    rowCount: rowCount,
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: isPagination,
    manualFiltering: isFiltering,
  })

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-13">
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="h-13">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {messageFeedback}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {isPagination && <DataTablePagination table={table} />}
    </div>
  )
}
