"use client"

export function Footer() {
  return (
    <footer className="flex h-14 w-full flex-col items-center justify-center gap-2 border-t text-sm text-muted-foreground">
      <p>
        &copy; {new Date().getFullYear()} Reservas de sala. Todos os direitos
        reservados.
      </p>
    </footer>
  )
}
