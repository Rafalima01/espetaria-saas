"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type ProductLite = { id: string; name: string; stock: number }

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function RestockDialog({
  open,
  onOpenChange,
  products,
  initialProductId,
  responsibleName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: ProductLite[]
  initialProductId?: string
  responsibleName: string
}) {
  const router = useRouter()
  const [productId, setProductId] = useState(initialProductId ?? "")
  const [quantityText, setQuantityText] = useState("")
  const [date, setDate] = useState(todayIso())
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setProductId(initialProductId ?? "")
      setQuantityText("")
      setDate(todayIso())
      setNote("")
    }
  }, [open, initialProductId])

  const selectedProduct = products.find((p) => p.id === productId)
  const quantity = Number(quantityText) || 0
  const resultingStock = selectedProduct ? selectedProduct.stock + quantity : 0

  async function handleConfirm() {
    if (!productId || quantity <= 0) {
      toast.error("Selecione um produto e uma quantidade válida")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/stock/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, date, note }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao reabastecer estoque")
        return
      }
      toast.success(`Estoque atualizado: ${selectedProduct?.name} agora tem ${data.product.stock} un.`)
      onOpenChange(false)
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reabastecer estoque</DialogTitle>
          <p className="text-sm text-muted-foreground">Responsável: {responsibleName}</p>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="restock-product">Produto</Label>
            <Select
              value={productId}
              onValueChange={(v) => setProductId(v ?? "")}
              items={Object.fromEntries(products.map((p) => [p.id, `${p.name} (estoque: ${p.stock})`]))}
              disabled={!!initialProductId}
            >
              <SelectTrigger id="restock-product" className="h-10 w-full rounded-xl">
                <SelectValue placeholder="Selecione" />
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

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="restock-quantity">Quantidade adicionada</Label>
              <Input
                id="restock-quantity"
                type="number"
                min={1}
                className="h-10 rounded-xl bg-background"
                value={quantityText}
                onChange={(e) => setQuantityText(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="restock-date">Data</Label>
              <Input
                id="restock-date"
                type="date"
                className="h-10 rounded-xl bg-background"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="restock-note">Observação</Label>
            <Textarea
              id="restock-note"
              placeholder="Reabastecimento"
              className="rounded-xl bg-background"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {selectedProduct && quantity > 0 && (
            <div className="flex items-end justify-between rounded-2xl bg-secondary/60 p-4">
              <span className="text-sm text-muted-foreground">
                {selectedProduct.stock} + {quantity}
              </span>
              <span className="text-sm text-muted-foreground">
                Novo estoque{" "}
                <span className="ml-1 text-2xl font-semibold text-primary tabular-nums">
                  {resultingStock}
                </span>
              </span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            className="h-11 w-full rounded-xl text-base font-semibold sm:w-auto"
            loading={submitting}
            disabled={!productId || quantity <= 0}
            onClick={handleConfirm}
          >
            {submitting ? "Salvando..." : "Confirmar reabastecimento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
