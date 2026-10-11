"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

interface ValuesType {
  capacity: string
  resourceIds: string[]
  setCapacity: (capacity: string) => void
  setResourceIds: (resourceIds: string[]) => void
  reset: () => void
}

function parseResourceIds(value: string | null): string[] {
  if (!value) return []

  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : []
  } catch {
    return []
  }
}

export function useParamsRooms() {
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

  const setCapacity = useCallback(
    (capacity: string) => {
      updateQueryString({ capacity: capacity || null })
    },
    [updateQueryString]
  )
  const setResourceIds = useCallback(
    (resourceIds: string[]) => {
      updateQueryString({
        resourcesIds:
          resourceIds.length > 0 ? JSON.stringify(resourceIds) : null,
      })
    },
    [updateQueryString]
  )

  const reset = useCallback(() => {
    updateQueryString({ capacity: null, resourcesIds: null })
  }, [updateQueryString])

  const values: ValuesType = {
    capacity: searchParams.get("capacity") ?? "",
    resourceIds: parseResourceIds(searchParams.get("resourcesIds")),
    setCapacity,
    setResourceIds,
    reset,
  }

  return values
}
