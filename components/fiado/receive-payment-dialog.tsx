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
import { cn } from "@/lib/utils"

type OpenEntry = {
  id: string
  description: string
  amount: number
  payments: { amount: number }[]
}

const METHODS: { id: string; label: string }[] = [
  { id: "CASH", label: "Dinheiro" },
  { id: "PIX", label: "PIX" },
  { id: "CREDIT", label: "Cartão Crédito" },
  { id: "DEBIT", label: "Cartão Débito" },
  { id: "VOUCHER", label: "Voucher" },
]

function centsToText(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",")
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

  const selectedEntry = entries.find((e) => e.id === entryId)
  const remaining = selectedEntry ? remainingByEntry(selectedEntry) : 0

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar recebimento</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
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
              <SelectTrigger className="h-10 w-full rounded-xl">
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

          {selectedEntry && (
            <div className="flex items-end justify-between rounded-2xl bg-secondary/60 p-4">
              <span className="text-sm text-muted-foreground">Restante da conta</span>
              <span className="text-2xl font-semibold text-primary tabular-nums">
                {centsToBRL(remaining)}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Valor recebido (R$)</Label>
              {selectedEntry && (
                <button
                  type="button"
                  onClick={() => setAmountText(centsToText(remaining))}
                  className="text-xs font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:underline"
                >
                  Receber o restante
                </button>
              )}
            </div>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0,00"
              className="h-10 rounded-xl bg-background text-base tabular-nums"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label id="receive-method-label">Forma de recebimento</Label>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby="receive-method-label">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={method === m.id}
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    method === m.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            className="h-11 w-full rounded-xl text-base font-semibold sm:w-auto"
            loading={submitting}
            disabled={!entryId || brlToCents(amountText) <= 0}
            onClick={handleConfirm}
          >
            {submitting ? "Salvando..." : "Confirmar recebimento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
