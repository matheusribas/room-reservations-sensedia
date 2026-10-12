"use client"

import { Input } from "@/components/ui/input"
import { useEffect, useState, type ComponentProps } from "react"

type InputDebounceProps = Omit<
  ComponentProps<"input">,
  "defaultValue" | "onChange" | "value"
> & {
  value?: string
  onValueChange: (value: string) => void
  delay?: number
}

export function InputDebounce({
  value = "",
  onValueChange,
  delay = 300,
  ...props
}: InputDebounceProps) {
  const [search, setSearch] = useState(value)

  useEffect(() => {
    setSearch(value)
  }, [value])

  useEffect(() => {
    if (search === value) return

    const timeoutId = setTimeout(() => onValueChange(search), delay)
    return () => clearTimeout(timeoutId)
  }, [delay, onValueChange, search, value])

  return (
    <Input
      {...props}
      value={search}
      onChange={(event) => setSearch(event.currentTarget.value)}
    />
  )
}
