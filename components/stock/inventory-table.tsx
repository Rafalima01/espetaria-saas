"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
import type { Product } from "@/lib/generated/prisma/client"

type MovementLite = { type: string; createdAt: string | Date } | null

const STATUS_FILTER_LABELS: Record<string, string> = {
  ALL: "Todos os status",
  NORMAL: "Normal",
  LOW: "Baixo",
  CRITICAL: "Crítico",
}

const ACTIVE_FILTER_LABELS: Record<string, string> = {
  ACTIVE: "Ativos",
  INACTIVE: "Inativos",
  ALL: "Todos",
}

export function InventoryTable({
  products,
  lastMovementByProduct,
  responsibleName,
}: {
  products: Product[]
  lastMovementByProduct: Record<string, MovementLite>
  responsibleName: string
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
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          placeholder="Buscar por nome, código ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={category}
          onValueChange={(v) => v && setCategory(v)}
          items={{ ALL: "Todas as categorias", ...Object.fromEntries(categories.map((c) => [c, c])) }}
        >
          <SelectTrigger className="w-full sm:w-48">
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
          <SelectTrigger className="w-full sm:w-48">
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
        <Select value={status} onValueChange={(v) => v && setStatus(v)} items={STATUS_FILTER_LABELS}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_FILTER_LABELS).map(([value, label]) => (
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
          <SelectTrigger className="w-full sm:w-32">
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

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Nenhum produto encontrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estoque atual</TableHead>
                <TableHead>Estoque mínimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última movimentação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => {
                const lastMovement = lastMovementByProduct[product.id]
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-muted-foreground">{product.category}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell className="text-muted-foreground">{product.minStock}</TableCell>
                    <TableCell>
                      <StockStatusBadge stock={product.stock} minStock={product.minStock} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {lastMovement
                        ? `${STOCK_MOVEMENT_TYPE_LABELS[lastMovement.type] ?? lastMovement.type} — ${new Date(
                            lastMovement.createdAt
                          ).toLocaleDateString("pt-BR")}`
                        : "-"}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2 text-right">
                      <Button
                        render={<Link href={`/estoque/${product.id}`} />}
                        nativeButton={false}
                        variant="outline"
                        size="sm"
                      >
                        Histórico
                      </Button>
                      <Button size="sm" onClick={() => setRestockProductId(product.id)}>
                        Reabastecer
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

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
