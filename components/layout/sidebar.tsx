"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { cn } from "@/lib/utils"

export function BrandMark({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo-sm.jpg"
        alt="JP Espeto Bar"
        width={40}
        height={40}
        priority
        className="size-10 shrink-0 rounded-xl ring-1 ring-border"
      />
      {!collapsed && (
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold tracking-tight">JP Espeto Bar</span>
          <span className="text-[11px] text-muted-foreground">Sistema de gestão</span>
        </div>
      )}
    </div>
  )
}

export function Sidebar({ role }: { role: string }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex md:flex-col",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center px-5",
          collapsed && "justify-center px-0"
        )}
      >
        <BrandMark collapsed={collapsed} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <SidebarNav role={role} collapsed={collapsed} />
      </div>

      <div className="p-3">
        <Button
          variant="ghost"
          size="icon"
          className="w-full text-muted-foreground"
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
