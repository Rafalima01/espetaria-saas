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
import { StatusPill } from "@/components/ui/status-pill"
import { centsToBRL } from "@/lib/money"
import { cn } from "@/lib/utils"

type CustomerRow = {
  id: string
  name: string
  phone: string
  status: string
  creditLimit: number
  balance: number
}

type Filter = "ALL" | "OWING" | "OVER" | "BLOCKED"

const FILTERS: { id: Filter; label: string }[] = [
  { id: "ALL", label: "Todos" },
  { id: "OWING", label: "Com saldo" },
  { id: "OVER", label: "Acima do limite" },
  { id: "BLOCKED", label: "Bloqueados" },
]

export function CustomerTable({ customers }: { customers: CustomerRow[] }) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("ALL")

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return customers.filter((c) => {
      if (filter === "OWING" && c.balance <= 0) return false
      if (filter === "OVER" && c.balance <= c.creditLimit) return false
      if (filter === "BLOCKED" && c.status !== "BLOCKED") return false
      if (!q) return true
      return c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
    })
  }, [customers, query, filter])

  return (
    <Card className="gap-0 p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-10 rounded-xl bg-background pl-9"
            placeholder="Buscar por nome ou telefone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filtro de clientes">
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
          {customers.length === 0 ? "Nenhum cliente cadastrado." : "Nenhum cliente encontrado."}
        </p>
      ) : (
        <div className="border-t border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Saldo devedor</TableHead>
                <TableHead>Uso do limite</TableHead>
                <TableHead className="text-right">Limite</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((c) => {
                const over = c.balance > c.creditLimit
                const usage =
                  c.creditLimit > 0 ? Math.min(100, Math.round((c.balance / c.creditLimit) * 100)) : c.balance > 0 ? 100 : 0
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-primary">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-medium">{c.name}</span>
                          <span className="text-xs text-muted-foreground">{c.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium tabular-nums",
                        over ? "text-destructive" : c.balance > 0 ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {centsToBRL(c.balance)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                          <span
                            className={cn("block h-full rounded-full", over ? "bg-destructive" : "bg-primary")}
                            style={{ width: `${usage}%` }}
                          />
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">{usage}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {centsToBRL(c.creditLimit)}
                    </TableCell>
                    <TableCell>
                      {c.status === "BLOCKED" ? (
                        <StatusPill tone="danger">Bloqueado</StatusPill>
                      ) : over ? (
                        <StatusPill tone="warning">Acima do limite</StatusPill>
                      ) : (
                        <StatusPill tone="success">Ativo</StatusPill>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          render={<Link href={`/fiado/clientes/${c.id}`} />}
                          nativeButton={false}
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-lg"
                        >
                          Ver conta
                          <ChevronRight className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  )
}
