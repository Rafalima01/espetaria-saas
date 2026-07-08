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
import { centsToBRL, brlToCents } from "@/lib/money"

type OpenEntry = {
  id: string
  description: string
  amount: number
  payments: { amount: number }[]
}

export function ReceivePaymentDialog({
  open,
  onOpenChange,
  entries,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  entries: OpenEntry[]
}) {
  const router = useRouter()
  const [entryId, setEntryId] = useState("")
  const [amountText, setAmountText] = useState("")
  const [method, setMethod] = useState("CASH")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setEntryId(entries[0]?.id ?? "")
      setAmountText("")
      setMethod("CASH")
    }
  }, [open])

  const remainingByEntry = (entry: OpenEntry) =>
    entry.amount - entry.payments.reduce((sum, p) => sum + p.amount, 0)

  async function handleConfirm() {
    setSubmitting(true)
    try {
      const amount = brlToCents(amountText)
      const res = await fetch(`/api/financial-entries/${entryId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao registrar recebimento")
        return
      }
      toast.success("Recebimento registrado")
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
          <DialogTitle>Registrar recebimento</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label>Conta</Label>
            <Select
              value={entryId}
              onValueChange={(v) => setEntryId(v ?? "")}
              items={Object.fromEntries(
                entries.map((e) => [
                  e.id,
                  `${e.description} — restante ${centsToBRL(remainingByEntry(e))}`,
                ])
              )}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {entries.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.description} — restante {centsToBRL(remainingByEntry(e))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Valor recebido (R$)</Label>
            <Input
              id="amount"
              placeholder="0,00"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Forma de recebimento</Label>
            <Select
              value={method}
              onValueChange={(v) => setMethod(v ?? "CASH")}
              items={{ CASH: "Dinheiro", PIX: "PIX", CREDIT: "Cartão Crédito", DEBIT: "Cartão Débito", VOUCHER: "Voucher" }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Dinheiro</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="CREDIT">Cartão Crédito</SelectItem>
                <SelectItem value="DEBIT">Cartão Débito</SelectItem>
                <SelectItem value="VOUCHER">Voucher</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={submitting || !entryId || brlToCents(amountText) <= 0}
            onClick={handleConfirm}
          >
            {submitting ? "Salvando..." : "Confirmar recebimento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
