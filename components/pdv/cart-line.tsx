"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { centsToBRL } from "@/lib/money"
import type { CartLine as CartLineType } from "@/lib/pdv/use-cart"

function getLineDisplay(line: CartLineType) {
  if (line.kind === "product") return { title: line.name, subtitle: null }
  if (line.kind === "dose") return { title: line.productName, subtitle: line.label }
  return { title: line.name, subtitle: "Receita" }
}

export function CartLine({
  line,
  onQtyChange,
  onNoteChange,
  onDiscountChange,
  onRemove,
}: {
  line: CartLineType
  onQtyChange: (quantity: number) => void
  onNoteChange: (note: string) => void
  onDiscountChange: (discountBRL: string) => void
  onRemove: () => void
}) {
  const [discountText, setDiscountText] = useState(
    line.discount ? (line.discount / 100).toFixed(2).replace(".", ",") : ""
  )
  const [noteText, setNoteText] = useState(line.note)
  const lineTotal = line.unitPrice * line.quantity - line.discount
  const { title, subtitle } = getLineDisplay(line)
  const maxQuantity = line.kind === "product" ? line.stock : undefined

  return (
    <div className="flex flex-col gap-2 border-b py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">
            {subtitle ? `${subtitle} — ` : ""}
            {centsToBRL(line.unitPrice)} un.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Cancelar item ${title}`}
          onClick={onRemove}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onQtyChange(line.quantity - 1)}
          >
            -
          </Button>
          <Input
            type="number"
            min={1}
            value={line.quantity}
            onChange={(e) => onQtyChange(Number(e.target.value) || 1)}
            className="w-14 text-center"
          />
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onQtyChange(line.quantity + 1)}
            disabled={maxQuantity !== undefined && line.quantity >= maxQuantity}
          >
            +
          </Button>
        </div>

        <Input
          placeholder="Desconto R$"
          className="w-28"
          value={discountText}
          onChange={(e) => setDiscountText(e.target.value)}
          onBlur={(e) => onDiscountChange(e.target.value)}
        />

        <Input
          placeholder="Observação"
          className="min-w-32 flex-1"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onBlur={(e) => onNoteChange(e.target.value)}
        />

        <span className="ml-auto text-sm font-semibold">{centsToBRL(lineTotal)}</span>
      </div>
    </div>
  )
}
