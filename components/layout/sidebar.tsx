"use client"

import { useState } from "react"
import { ChevronsLeft, ChevronsRight, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { cn } from "@/lib/utils"

export function Sidebar({ role }: { role: string }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r bg-card transition-[width] duration-200 md:flex md:flex-col",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center gap-2 border-b px-4",
          collapsed && "justify-center px-0"
        )}
      >
        <UtensilsCrossed className="size-5 shrink-0 text-primary" />
        {!collapsed && <span className="font-semibold">Espetaria</span>}
      </div>

      <div className="flex-1 overflow-y-auto">
        <SidebarNav role={role} collapsed={collapsed} />
      </div>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <ChevronsLeft className="size-4" />
          )}
        </Button>
      </div>
    </aside>
  )
}
