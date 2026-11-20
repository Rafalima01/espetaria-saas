"use client"

import { useState } from "react"
import { ChevronDown, Minus, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { centsToBRL } from "@/lib/money"
import { cn } from "@/lib/utils"
import type { CartLine as CartLineType } from "@/lib/pdv/use-cart"

function getLineDisplay(line: CartLineType) {
  if (line.kind === "product") return { title: line.name, subtitle: null }
  if (line.kind === "dose") return { title: line.productName, subtitle: line.label }
  return { title: line.name, subtitle: "Receita" }
}

const STEP_BUTTON =
  "flex size-7 items-center justify-center rounded-full text-foreground transition-colors outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40"

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
  const [detailsOpen, setDetailsOpen] = useState(Boolean(line.discount || line.note))
  const lineTotal = line.unitPrice * line.quantity - line.discount
  const { title, subtitle } = getLineDisplay(line)
  const maxQuantity = line.kind === "product" ? line.stock : undefined

  return (
    <div className="animate-rise-in flex flex-col gap-3 rounded-2xl bg-secondary/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">
            {subtitle ? `${subtitle} · ` : ""}
            {centsToBRL(line.unitPrice)} un.
          </p>
        </div>
        <button
          type="button"
          aria-label={`Remover item ${title}`}
          onClick={onRemove}
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-destructive/15 hover:text-destructive focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center rounded-full bg-background p-0.5 ring-1 ring-foreground/10">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            className={STEP_BUTTON}
            onClick={() => onQtyChange(line.quantity - 1)}
          >
            <Minus className="size-3.5" />
          </button>
          <input
            type="number"
            min={1}
            aria-label="Quantidade"
            value={line.quantity}
            onChange={(e) => onQtyChange(Number(e.target.value) || 1)}
            className="w-10 [appearance:textfield] bg-transparent text-center text-sm font-medium tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            aria-label="Aumentar quantidade"
            className={STEP_BUTTON}
            onClick={() => onQtyChange(line.quantity + 1)}
            disabled={maxQuantity !== undefined && line.quantity >= maxQuantity}
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        <button
          type="button"
          aria-expanded={detailsOpen}
          onClick={() => setDetailsOpen((o) => !o)}
          className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
        >
          Desconto e obs.
          <ChevronDown className={cn("size-3.5 transition-transform", detailsOpen && "rotate-180")} />
        </button>

        <span className="text-sm font-semibold text-primary tabular-nums">{centsToBRL(lineTotal)}</span>
      </div>

      {detailsOpen && (
        <div className="grid grid-cols-[7rem_1fr] gap-2">
          <Input
            placeholder="Desconto R$"
            className="rounded-xl bg-background"
            value={discountText}
            onChange={(e) => setDiscountText(e.target.value)}
            onBlur={(e) => onDiscountChange(e.target.value)}
          />
          <Input
            placeholder="Observação"
            className="rounded-xl bg-background"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onBlur={(e) => onNoteChange(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
