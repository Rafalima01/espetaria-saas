"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { STOCK_MOVEMENT_TYPE_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/generated/prisma/client"

// Entrada (IN) has its own dedicated flow — see "Reabastecer Estoque" — so it's
// intentionally left out of this generic movement form.
const MOVEMENT_TYPES = ["OUT", "LOSS", "BREAKAGE", "ADJUSTMENT"] as const

export function StockMovementForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [productId, setProductId] = useState<string>("")
  const [type, setType] = useState<string>("LOSS")

  const selectedProduct = products.find((p) => p.id === productId)
  const isAdjustment = type === "ADJUSTMENT"

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!productId) {
      toast.error("Selecione um produto")
      return
    }
    setSubmitting(true)
    try {
      const form = new FormData(e.currentTarget)
      const payload = {
        productId,
        type,
        quantity: Number(form.get("quantity") ?? 0),
        reason: String(form.get("reason") ?? ""),
      }

      const res = await fetch("/api/stock/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error?.formErrors?.[0] ?? data.error ?? "Erro ao registrar")
        return
      }

      toast.success("Movimentação registrada")
      router.push("/estoque")
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="product">Produto</Label>
            <Select
              value={productId}
              onValueChange={(v) => v && setProductId(v)}
              items={Object.fromEntries(
                products.map((p) => [p.id, `${p.name} (estoque: ${p.stock})`])
              )}
              required
            >
              <SelectTrigger id="product" className="h-10 w-full rounded-xl">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} (estoque: {p.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label id="type-label">Tipo</Label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="type-label">
              {MOVEMENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={type === t}
                  onClick={() => setType(t)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    type === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {STOCK_MOVEMENT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="quantity">
              {isAdjustment ? "Novo estoque total" : "Quantidade"}
            </Label>
            <Input
              // Remount when the type or product changes so the adjustment
              // default (current stock) is applied again.
              key={`${type}-${productId}`}
              id="quantity"
              name="quantity"
              type="number"
              min={0}
              required
              className="h-10 rounded-xl bg-background sm:max-w-48"
              defaultValue={isAdjustment ? selectedProduct?.stock : undefined}
            />
            {isAdjustment && selectedProduct && (
              <p className="text-xs text-muted-foreground">
                Estoque atual: {selectedProduct.stock}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea id="reason" name="reason" className="min-h-24 rounded-xl bg-background" />
          </div>

          <div className="flex gap-2">
            <Button type="submit" loading={submitting} className="h-11 rounded-xl px-5 font-semibold">
              {submitting ? "Salvando..." : "Registrar movimentação"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 rounded-xl"
              onClick={() => router.push("/estoque")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
