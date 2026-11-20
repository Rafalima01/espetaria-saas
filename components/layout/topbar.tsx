"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { CommandPalette } from "@/components/layout/command-palette"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { BrandMark } from "@/components/layout/sidebar"
import { NotificationBell } from "@/components/stock/notification-bell"
import { NAV_ITEMS, ROLE_LABELS } from "@/components/layout/nav-items"
import { logoutAction } from "@/app/(dashboard)/actions"
import type { LowStockAlert } from "@/lib/stock/getLowStockAlerts"
import type { FixedCostAlert } from "@/lib/financeiro/getFixedCostAlerts"

export function Topbar({
  name,
  role,
  lowStockAlerts = [],
  fixedCostAlerts = [],
}: {
  name: string
  role: string
  lowStockAlerts?: LowStockAlert[]
  fixedCostAlerts?: FixedCostAlert[]
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const current = NAV_ITEMS.find((i) => pathname.startsWith(i.href))
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4 md:px-6">
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
          <SheetContent side="left" className="w-72 bg-sidebar p-0">
            <SheetHeader className="h-16 justify-center border-b border-sidebar-border px-5">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <BrandMark />
            </SheetHeader>
            <SidebarNav role={role} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2 text-sm">
          <span className="hidden text-muted-foreground sm:inline">
            {current?.group ?? "JP Espeto Bar"}
          </span>
          {current && (
            <>
              <span className="hidden text-muted-foreground sm:inline">/</span>
              <span key={current.title} className="animate-rise-in font-medium">
                {current.title}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <CommandPalette role={role} />
        <ThemeToggle />
        {(role === "ADMIN" || role === "MANAGER") && (
          <NotificationBell stockAlerts={lowStockAlerts} financialAlerts={fixedCostAlerts} />
        )}
        <div className="mx-2 hidden h-6 w-px bg-border sm:block" />
        <div className="mr-1 hidden flex-col items-end leading-tight sm:flex">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">
            {ROLE_LABELS[role] ?? role}
          </span>
        </div>
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
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
