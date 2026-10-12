import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Wrapper } from "./_components/wrapper"

export default async function CreateRoomPage() {
  const user = await getCurrentUser()

  if (user?.role !== "admin") {
    redirect("/")
  }

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
