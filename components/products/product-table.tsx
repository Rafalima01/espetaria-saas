"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Pencil, Power, Search } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { centsToBRL } from "@/lib/money"
import { cn } from "@/lib/utils"
import { PRODUCT_TYPE_LABELS } from "@/lib/constants"
import { getStockStatus } from "@/lib/stock/getStockStatus"
import type { Product } from "@/lib/generated/prisma/client"

type Filter = "ALL" | "ACTIVE" | "INACTIVE" | "LOW"

const FILTERS: { id: Filter; label: string }[] = [
  { id: "ALL", label: "Todos" },
  { id: "ACTIVE", label: "Ativos" },
  { id: "INACTIVE", label: "Inativos" },
  { id: "LOW", label: "Estoque baixo" },
]

const STOCK_TEXT = {
  NORMAL: "text-foreground",
  LOW: "text-warning",
  CRITICAL: "text-destructive",
} as const

function Thumb({ product }: { product: Product }) {
  if (product.photoUrl) {
    return (
      <Image
        src={product.photoUrl}
        alt=""
        width={40}
        height={40}
        unoptimized
        className="size-10 shrink-0 rounded-xl object-cover"
      />
    )
  }
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-primary">
      {product.name.charAt(0).toUpperCase()}
    </span>
  )
}

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("ALL")

  async function toggleActive(product: Product) {
    const res = await fetch(`/api/products/${product.id}`, {
      method: product.active ? "DELETE" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: product.active ? undefined : JSON.stringify({ active: true }),
    })
    if (!res.ok) {
      toast.error("Erro ao atualizar produto")
      return
    }
    toast.success(product.active ? "Produto desativado" : "Produto ativado")
    router.refresh()
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (filter === "ACTIVE" && !p.active) return false
      if (filter === "INACTIVE" && p.active) return false
      if (filter === "LOW" && (!p.active || getStockStatus(p.stock, p.minStock) === "NORMAL"))
        return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q)
      )
    })
  }, [products, query, filter])

  return (
    <Card className="gap-0 p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-10 rounded-xl bg-background pl-9"
            placeholder="Buscar por nome, categoria ou código"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filtro de produtos">
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
          Nenhum produto encontrado.
        </p>
      ) : (
        <div className="border-t border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Preço de venda</TableHead>
                <TableHead className="text-right">Margem</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((product) => {
                const isFractional = product.productType === "FRACTIONAL"
                const status = getStockStatus(product.stock, product.minStock)
                const margin =
                  !isFractional && product.salePrice > 0
                    ? Math.round(((product.salePrice - product.purchasePrice) / product.salePrice) * 100)
                    : null
                return (
                  <TableRow key={product.id} className={cn(!product.active && "opacity-60")}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Thumb product={product} />
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-medium">{product.name}</span>
                          <span className="text-xs text-muted-foreground">{product.category}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {PRODUCT_TYPE_LABELS[product.productType] ?? product.productType}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {isFractional ? (
                        <div className="flex flex-col items-end">
                          <span className="text-primary">Por dose</span>
                          {product.fullBottleSalePrice ? (
                            <span className="text-xs text-muted-foreground">
                              Garrafa {centsToBRL(product.fullBottleSalePrice)}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="font-medium text-primary">{centsToBRL(product.salePrice)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {margin === null ? "—" : `${margin}%`}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className={cn("font-medium", STOCK_TEXT[status])}>{product.stock}</span>
                      <span className="text-xs text-muted-foreground"> / mín. {product.minStock}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          render={<Link href={`/produtos/${product.id}`} />}
                          nativeButton={false}
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar ${product.name}`}
                          title="Editar"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`${product.active ? "Desativar" : "Ativar"} ${product.name}`}
                          title={product.active ? "Desativar" : "Ativar"}
                          className={product.active ? "hover:text-destructive" : "hover:text-primary"}
                          onClick={() => toggleActive(product)}
                        >
                          <Power className="size-4" />
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
