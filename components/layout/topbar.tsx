"use client"

import { useState } from "react"
import { Menu, LogOut, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { NotificationBell } from "@/components/stock/notification-bell"
import { ROLE_LABELS } from "@/components/layout/nav-items"
import { logoutAction } from "@/app/(dashboard)/actions"
import type { LowStockAlert } from "@/lib/stock/getLowStockAlerts"

export function Topbar({
  name,
  role,
  lowStockAlerts = [],
}: {
  name: string
  role: string
  lowStockAlerts?: LowStockAlert[]
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b bg-card px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Abrir menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="h-14 flex-row items-center gap-2 border-b px-4">
              <UtensilsCrossed className="size-5 text-primary" />
              <SheetTitle>Espetaria</SheetTitle>
            </SheetHeader>
            <SidebarNav role={role} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-2">
        {(role === "ADMIN" || role === "MANAGER") && (
          <NotificationBell alerts={lowStockAlerts} />
        )}
        <ThemeToggle />
        <div className="mx-1 hidden flex-col items-end leading-tight sm:flex">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">
            {ROLE_LABELS[role] ?? role}
          </span>
        </div>
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <form action={logoutAction}>
          <Button variant="ghost" size="icon" aria-label="Sair" type="submit">
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  )
}
