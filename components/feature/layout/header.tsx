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
import { LogOutIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function Header() {
  // TODO: Fazer hook com os dados do usuário logado
  const user = { name: "Matheus Felipe" }
  const firstName = user.name.split(" ")[0]
  const { setTheme } = useTheme()

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    setTheme(theme)
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
        <DropdownMenuContent className="w-40" align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
            <DropdownMenuItem>
              <UserIcon />
              Perfil
            </DropdownMenuItem>
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
          <DropdownMenuItem
            variant="destructive"
            render={<Link href="/login" />}
          >
            <LogOutIcon />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
