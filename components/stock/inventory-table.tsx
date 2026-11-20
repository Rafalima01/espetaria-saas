"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { History, PackagePlus, Search } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StockStatusBadge } from "@/components/stock/stock-status-badge"
import { RestockDialog } from "@/components/stock/restock-dialog"
import { STOCK_MOVEMENT_TYPE_LABELS, PRODUCT_TYPE_LABELS } from "@/lib/constants"
import { getStockStatus } from "@/lib/stock/getStockStatus"
import { cn } from "@/lib/utils"
import type { FractionalStockSummary } from "@/lib/bottles/getFractionalStockSummary"
import type { Product } from "@/lib/generated/prisma/client"

type MovementLite = { type: string; createdAt: string | Date } | null

const STATUS_CHIPS: { id: string; label: string }[] = [
  { id: "ALL", label: "Todos" },
  { id: "NORMAL", label: "Normal" },
  { id: "LOW", label: "Baixo" },
  { id: "CRITICAL", label: "Crítico" },
]

const ACTIVE_FILTER_LABELS: Record<string, string> = {
  ACTIVE: "Ativos",
  INACTIVE: "Inativos",
  ALL: "Todos",
}

const SELECT_TRIGGER = "h-10 w-full rounded-xl bg-background sm:w-48"

export function InventoryTable({
  products,
  lastMovementByProduct,
  responsibleName,
  fractionalSummaries = {},
}: {
  products: Product[]
  lastMovementByProduct: Record<string, MovementLite>
  responsibleName: string
  fractionalSummaries?: Record<string, FractionalStockSummary>
}) {
  const [restockProductId, setRestockProductId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("ALL")
  const [productType, setProductType] = useState("ALL")
  const [status, setStatus] = useState("ALL")
  const [activeFilter, setActiveFilter] = useState("ACTIVE")

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (activeFilter === "ACTIVE" && !p.active) return false
      if (activeFilter === "INACTIVE" && p.active) return false
      if (category !== "ALL" && p.category !== category) return false
      if (productType !== "ALL" && p.productType !== productType) return false
      if (status !== "ALL" && getStockStatus(p.stock, p.minStock) !== status) return false
      if (q) {
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [products, search, category, productType, status, activeFilter])

  const productsLite = products
    .filter((p) => p.active)
    .map((p) => ({ id: p.id, name: p.name, stock: p.stock }))

  return (
    <>
      <Card className="gap-0 p-0">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, código ou categoria"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 rounded-xl bg-background pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filtro por status">
              {STATUS_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  role="tab"
                  aria-selected={status === chip.id}
                  onClick={() => setStatus(chip.id)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    status === chip.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Select
              value={category}
              onValueChange={(v) => v && setCategory(v)}
              items={{ ALL: "Todas as categorias", ...Object.fromEntries(categories.map((c) => [c, c])) }}
            >
              <SelectTrigger className={SELECT_TRIGGER}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as categorias</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={productType}
              onValueChange={(v) => v && setProductType(v)}
              items={{ ALL: "Todos os tipos", ...PRODUCT_TYPE_LABELS }}
            >
              <SelectTrigger className={SELECT_TRIGGER}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os tipos</SelectItem>
                {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={activeFilter}
              onValueChange={(v) => v && setActiveFilter(v)}
              items={ACTIVE_FILTER_LABELS}
            >
              <SelectTrigger className="h-10 w-full rounded-xl bg-background sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACTIVE_FILTER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="border-t border-border p-10 text-center text-sm text-muted-foreground">
            Nenhum produto encontrado.
          </p>
        ) : (
          <div className="border-t border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Estoque atual</TableHead>
                  <TableHead className="text-right">Mínimo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Doses restantes</TableHead>
                  <TableHead>Última movimentação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => {
                  const lastMovement = lastMovementByProduct[product.id]
                  const fractional =
                    product.productType === "FRACTIONAL" ? fractionalSummaries[product.id] : undefined
                  return (
                    <TableRow key={product.id} className={cn(!product.active && "opacity-60")}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-xs text-muted-foreground">{product.category}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fractional ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-medium">
                              {fractional.physicalBottles} garrafas · {fractional.totalVolumeMl}ml
                            </span>
                            <span className="h-1 w-24 overflow-hidden rounded-full bg-secondary">
                              <span
                                className="block h-full rounded-full bg-primary"
                                style={{ width: `${Math.min(100, Math.max(0, fractional.percentRemaining))}%` }}
                              />
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium">{product.stock}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground tabular-nums">
                        {product.minStock}
                      </TableCell>
                      <TableCell>
                        <StockStatusBadge stock={product.stock} minStock={product.minStock} />
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground tabular-nums">
                        {fractional ? (fractional.dosesRemaining ?? "—") : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lastMovement
                          ? `${STOCK_MOVEMENT_TYPE_LABELS[lastMovement.type] ?? lastMovement.type} · ${new Date(
                              lastMovement.createdAt
                            ).toLocaleDateString("pt-BR")}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1.5">
                          <Button
                            render={<Link href={`/estoque/${product.id}`} />}
                            nativeButton={false}
                            variant="ghost"
                            size="icon"
                            aria-label={`Histórico de ${product.name}`}
                            title="Histórico"
                          >
                            <History className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 rounded-lg px-3"
                            onClick={() => setRestockProductId(product.id)}
                          >
                            <PackagePlus className="size-3.5" />
                            Reabastecer
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

      <RestockDialog
        open={restockProductId !== null}
        onOpenChange={(open) => !open && setRestockProductId(null)}
        products={productsLite}
        initialProductId={restockProductId ?? undefined}
        responsibleName={responsibleName}
      />
    </>
  )
}
