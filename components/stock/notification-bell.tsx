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
import type { FixedCostAlert } from "@/lib/financeiro/getFixedCostAlerts"
import { centsToBRL } from "@/lib/money"

export function NotificationBell({
  stockAlerts = [],
  financialAlerts = [],
}: {
  stockAlerts?: LowStockAlert[]
  financialAlerts?: FixedCostAlert[]
}) {
  const total = stockAlerts.length + financialAlerts.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Notificações" />}>
        <span className="relative">
          <Bell className="size-4" />
          {total > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {total > 9 ? "9+" : total}
            </span>
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        {stockAlerts.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Alertas de estoque</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {stockAlerts.slice(0, 8).map((p) => (
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
            ))}
          </DropdownMenuGroup>
        )}
        {financialAlerts.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Contas a pagar</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {financialAlerts.slice(0, 8).map((f) => (
              <DropdownMenuItem key={f.id} render={<Link href="/financeiro/despesas-fixas" />}>
                <div className="flex w-full items-center justify-between gap-2 text-sm">
                  <span>
                    {f.status === "OVERDUE" ? "🔴" : "🟡"} {f.description}
                  </span>
                  <span className="text-xs text-muted-foreground">{centsToBRL(f.amount)}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
        {total === 0 && (
          <p className="px-2 py-3 text-sm text-muted-foreground">Nenhum alerta no momento.</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
