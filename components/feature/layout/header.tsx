"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { toast } from "@/components/ui/toast"
import { useLogout } from "@/hooks/auth/use-logout"
import { useBoundStore } from "@/stores"
import { LogOutIcon, UserIcon } from "lucide-react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

export function Header() {
  const router = useRouter()
  const userAuth = useBoundStore((state) => state.auth)
  const logout = useBoundStore((state) => state.logout)
  const mutateLogout = useLogout()

  const firstName = userAuth ? userAuth.name.split(" ")[0] : "Sem usuário"
  const { setTheme } = useTheme()

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    setTheme(theme)
  }
  const handleLogout = () => {
    mutateLogout.mutateAsync().then(
      () => {
        toast.add({
          type: "success",
          title: `Até mais ${userAuth?.name.split(" ")[0]}!`,
        })
        router.push("/login")
        logout()
      },
      () => undefined
    )
  }

  return (
    <header className="flex min-h-16 w-full items-center justify-between gap-6 pr-4 pl-4 sm:min-h-16 sm:gap-10 sm:pr-10 sm:pl-6">
      <SidebarTrigger />
      <span />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="flex items-center gap-2">
              <p>Olá, {firstName}</p>
              <UserIcon />
            </Button>
          }
        />
        <DropdownMenuContent className="w-50" align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Preferências</DropdownMenuLabel>
            <DropdownMenuItem
              className="hidden transition-all dark:flex"
              onClick={() => handleThemeChange("light")}
            >
              <Sun />
              Tema claro
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex transition-all dark:hidden"
              onClick={() => handleThemeChange("dark")}
            >
              <Moon />
              Tema escuro
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <LogOutIcon />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
