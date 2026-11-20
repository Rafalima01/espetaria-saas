"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { StatusPill, type PillTone } from "@/components/ui/status-pill"
import { centsToBRL } from "@/lib/money"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

type SaleRow = {
  id: string
  createdAt: Date
  total: number
  status: string
  user: { name: string }
  payments: { method: string }[]
}

const STATUS_TONE: Record<string, PillTone> = {
  COMPLETED: "success",
  CANCELLED: "danger",
  OPEN: "warning",
}

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  OPEN: "Em aberto",
}

const FILTERS: { id: string; label: string }[] = [
  { id: "ALL", label: "Todas" },
  { id: "COMPLETED", label: "Concluídas" },
  { id: "CANCELLED", label: "Canceladas" },
]

export function SalesTable({ sales }: { sales: SaleRow[] }) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("ALL")

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sales.filter((s) => {
      if (filter !== "ALL" && s.status !== filter) return false
      if (!q) return true
      return s.id.toLowerCase().includes(q) || s.user.name.toLowerCase().includes(q)
    })
  }, [sales, query, filter])

  return (
    <Card className="gap-0 p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-10 rounded-xl bg-background pl-9"
            placeholder="Buscar por código ou vendedor"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filtro por status">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
                filter === f.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="border-t border-border p-10 text-center text-sm text-muted-foreground">
          {sales.length === 0 ? "Nenhuma venda registrada." : "Nenhuma venda encontrada."}
        </p>
      ) : (
        <div className="border-t border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Data</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="text-muted-foreground">
                    {new Date(sale.createdAt).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                      {sale.id.slice(-8)}
                    </span>
                  </TableCell>
                  <TableCell>{sale.user.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {sale.payments.map((p) => PAYMENT_METHOD_LABELS[p.method] ?? p.method).join(" + ")}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium tabular-nums",
                      sale.status === "CANCELLED" && "text-muted-foreground line-through"
                    )}
                  >
                    {centsToBRL(sale.total)}
                  </TableCell>
                  <TableCell>
                    <StatusPill tone={STATUS_TONE[sale.status] ?? "neutral"}>
                      {STATUS_LABELS[sale.status] ?? sale.status}
                    </StatusPill>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg"
                        render={<Link href={`/vendas/${sale.id}`} />}
                        nativeButton={false}
                      >
                        Detalhes
                        <ChevronRight className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  )
}
