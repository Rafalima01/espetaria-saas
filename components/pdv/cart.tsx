"use client"

import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CartLine } from "@/components/pdv/cart-line"
import { centsToBRL } from "@/lib/money"
import type { CartLine as CartLineType } from "@/lib/pdv/use-cart"

export function Cart({
  lines,
  saleDiscount,
  saleSurcharge,
  subtotal,
  total,
  onQtyChange,
  onNoteChange,
  onLineDiscountChange,
  onRemove,
  onSaleDiscountChange,
  onSaleSurchargeChange,
  onFinalize,
}: {
  lines: CartLineType[]
  saleDiscount: number
  saleSurcharge: number
  subtotal: number
  total: number
  onQtyChange: (key: string, quantity: number) => void
  onNoteChange: (key: string, note: string) => void
  onLineDiscountChange: (key: string, discountBRL: string) => void
  onRemove: (key: string) => void
  onSaleDiscountChange: (discountBRL: string) => void
  onSaleSurchargeChange: (surchargeBRL: string) => void
  onFinalize: () => void
}) {
  const [discountText, setDiscountText] = useState(
    saleDiscount ? (saleDiscount / 100).toFixed(2).replace(".", ",") : ""
  )
  const [surchargeText, setSurchargeText] = useState(
    saleSurcharge ? (saleSurcharge / 100).toFixed(2).replace(".", ",") : ""
  )
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0)

  return (
    <Card className="flex h-full flex-col gap-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Pedido atual</CardTitle>
            <CardDescription>
              {itemCount === 0 ? "Nenhum item" : `${itemCount} ${itemCount === 1 ? "item" : "itens"}`}
            </CardDescription>
          </div>
          <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
            <ShoppingBag className="size-4" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex min-h-40 flex-1 flex-col gap-2 overflow-y-auto">
          {lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-6 text-center">
              <ShoppingBag className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Toque em um produto para adicionar ao pedido.
              </p>
            </div>
          ) : (
            lines.map((line) => (
              <CartLine
                key={line.key}
                line={line}
                onQtyChange={(q) => onQtyChange(line.key, q)}
                onNoteChange={(n) => onNoteChange(line.key, n)}
                onDiscountChange={(d) => onLineDiscountChange(line.key, d)}
                onRemove={() => onRemove(line.key)}
              />
            ))
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-secondary/60 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{centsToBRL(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between gap-2 text-sm">
            <label htmlFor="sale-discount" className="text-muted-foreground">
              Desconto
            </label>
            <Input
              id="sale-discount"
              className="w-28 rounded-xl bg-background text-right"
              placeholder="0,00"
              value={discountText}
              onChange={(e) => setDiscountText(e.target.value)}
              onBlur={(e) => onSaleDiscountChange(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-sm">
            <label htmlFor="sale-surcharge" className="text-muted-foreground">
              Acréscimo
            </label>
            <Input
              id="sale-surcharge"
              className="w-28 rounded-xl bg-background text-right"
              placeholder="0,00"
              value={surchargeText}
              onChange={(e) => setSurchargeText(e.target.value)}
              onBlur={(e) => onSaleSurchargeChange(e.target.value)}
            />
          </div>

          <div className="flex items-end justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-3xl font-semibold tracking-tight tabular-nums">
              {centsToBRL(total)}
            </span>
          </div>
        </div>

        <Button
          size="lg"
          className="h-12 w-full rounded-2xl text-base font-semibold shadow-[0_0_30px_-8px_var(--primary)]"
          disabled={lines.length === 0}
          onClick={onFinalize}
        >
          Finalizar venda
          <kbd className="ml-1 hidden rounded-md bg-primary-foreground/15 px-1.5 py-0.5 text-[11px] font-medium sm:inline">
            F2
          </kbd>
        </Button>
      </CardContent>
    </Card>
  )
}
