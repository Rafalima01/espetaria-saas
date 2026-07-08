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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reabastecer estoque</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="restock-product">Produto</Label>
            <Select
              value={productId}
              onValueChange={(v) => setProductId(v ?? "")}
              items={Object.fromEntries(products.map((p) => [p.id, `${p.name} (estoque: ${p.stock})`]))}
              disabled={!!initialProductId}
            >
              <SelectTrigger id="restock-product" className="w-full">
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="restock-quantity">Quantidade adicionada</Label>
            <Input
              id="restock-quantity"
              type="number"
              min={1}
              value={quantityText}
              onChange={(e) => setQuantityText(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="restock-date">Data</Label>
            <Input
              id="restock-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="restock-note">Observação</Label>
            <Textarea
              id="restock-note"
              placeholder="Reabastecimento"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Responsável</Label>
            <p className="text-sm text-muted-foreground">{responsibleName}</p>
          </div>

          {selectedProduct && quantity > 0 && (
            <p className="text-sm text-muted-foreground">
              Novo estoque: {selectedProduct.stock} + {quantity} ={" "}
              <span className="font-semibold text-foreground">{resultingStock}</span>
            </p>
          )}
        </div>
        <DialogFooter>
          <Button disabled={submitting || !productId || quantity <= 0} onClick={handleConfirm}>
            {submitting ? "Salvando..." : "Confirmar reabastecimento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
