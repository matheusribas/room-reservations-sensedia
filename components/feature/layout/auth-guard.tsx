"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/auth/use-auth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { error, isAuthenticated, isLoading, retry } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !error) {
      router.replace("/login")
    }
  }, [error, isAuthenticated, isLoading, router])

  if (error) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <div className="flex flex-col items-center gap-4">
          <p role="alert">Não foi possível validar sua sessão.</p>
          <Button onClick={() => void retry()}>Tentar novamente</Button>
        </div>
      </main>
    )
  }

  return children
}
