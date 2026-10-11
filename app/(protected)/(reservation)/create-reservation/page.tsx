import { Suspense } from "react"
import { Wrapper } from "./_components/wrapper"

export default function CreateReservationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
          Carregando formulário...
        </div>
      }
    >
      <Wrapper />
    </Suspense>
  )
}
