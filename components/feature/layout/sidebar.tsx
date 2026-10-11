"use client"

import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { CalendarDaysIcon, DoorClosedIcon, UsersRoundIcon } from "lucide-react"
import Link from "next/link"
import { ImageLogo } from "@/components/shared/image-logo"

export function Sidebar() {
  const { state } = useSidebar()

  return (
    <SidebarUI collapsible="icon">
      <SidebarHeader className="mb-4">
        <Link href="/" about="Ir para minhas reservas">
          <ImageLogo minify={state === "collapsed"} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuButton
              render={<Link href="/" />}
              tooltip="Minhas Reservas"
            >
              <CalendarDaysIcon /> Minhas Reservas
            </SidebarMenuButton>
            <SidebarMenuButton render={<Link href="/rooms" />} tooltip="Salas">
              <DoorClosedIcon /> Salas
            </SidebarMenuButton>
            <SidebarMenuButton
              render={<Link href="/users" />}
              tooltip="Usuários"
            >
              <UsersRoundIcon /> Usuários
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </SidebarUI>
  )
}
