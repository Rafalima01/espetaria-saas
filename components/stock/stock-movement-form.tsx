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
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="product">Produto</Label>
            <Select
              value={productId}
              onValueChange={(v) => v && setProductId(v)}
              items={Object.fromEntries(
                products.map((p) => [p.id, `${p.name} (estoque: ${p.stock})`])
              )}
              required
            >
              <SelectTrigger id="product" className="w-full">
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
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={type}
              onValueChange={(v) => v && setType(v)}
              items={Object.fromEntries(
                MOVEMENT_TYPES.map((t) => [t, STOCK_MOVEMENT_TYPE_LABELS[t]])
              )}
              required
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOVEMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {STOCK_MOVEMENT_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="quantity">
              {isAdjustment ? "Novo estoque total" : "Quantidade"}
            </Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min={0}
              required
              defaultValue={isAdjustment ? selectedProduct?.stock : undefined}
            />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea id="reason" name="reason" />
          </div>

          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Registrar movimentação"}
            </Button>
            <Button
              type="button"
              variant="outline"
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
