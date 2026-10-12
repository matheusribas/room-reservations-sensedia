"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

interface ValuesType {
  date: string
  setDate: (date: Date | undefined) => void
  reset: () => void
}

export function useParamsReservations() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([name, value]) => {
        if (value === null || value === "") params.delete(name)
        else params.set(name, value)
      })

      const queryString = params.toString()
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      })
    },
    [pathname, router, searchParams]
  )

  const setDate = useCallback(
    (date: Date | undefined) => {
      updateQueryString({
        date:
          date !== undefined ? date.toISOString() : new Date().toISOString(),
      })
    },
    [updateQueryString]
  )

  const reset = useCallback(() => {
    updateQueryString({ date: new Date().toISOString() })
  }, [updateQueryString])

  const values: ValuesType = {
    date: searchParams.get("date") ?? new Date().toISOString(),
    setDate,
    reset,
  }

  return values
}
