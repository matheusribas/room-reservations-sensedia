"use client"

export function Footer() {
  return (
    <footer className="flex h-14 w-full items-center justify-between gap-2 border-t px-4 text-sm text-muted-foreground sm:pr-10 sm:pl-8">
      <p>&copy; {new Date().getFullYear()} - Reservas de sala (Sensedia)</p>
      <p>Todos os direitos reservados.</p>
    </footer>
  )
}
