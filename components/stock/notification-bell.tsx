"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import type { LowStockAlert } from "@/lib/stock/getLowStockAlerts"

export function NotificationBell({ alerts }: { alerts: LowStockAlert[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Notificações" />}>
        <span className="relative">
          <Bell className="size-4" />
          {alerts.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {alerts.length > 9 ? "9+" : alerts.length}
            </span>
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Alertas de estoque</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {alerts.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">Nenhum alerta no momento.</p>
          ) : (
            alerts.slice(0, 8).map((p) => (
              <DropdownMenuItem key={p.id} render={<Link href={`/estoque/${p.id}`} />}>
                <div className="flex w-full items-center justify-between gap-2 text-sm">
                  <span>
                    {p.status === "CRITICAL" ? "🔴" : "🟡"} {p.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {p.stock}/{p.minStock}
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
