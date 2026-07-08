"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Carrinho</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum item adicionado. Clique em um produto para começar.
            </p>
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

        <div className="flex flex-col gap-2 border-t pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{centsToBRL(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">Desconto da venda</span>
            <Input
              className="w-28"
              placeholder="0,00"
              value={discountText}
              onChange={(e) => setDiscountText(e.target.value)}
              onBlur={(e) => onSaleDiscountChange(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">Acréscimo da venda</span>
            <Input
              className="w-28"
              placeholder="0,00"
              value={surchargeText}
              onChange={(e) => setSurchargeText(e.target.value)}
              onBlur={(e) => onSaleSurchargeChange(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{centsToBRL(total)}</span>
          </div>

          <Button
            size="lg"
            className="mt-2 w-full"
            disabled={lines.length === 0}
            onClick={onFinalize}
          >
            Finalizar venda
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
