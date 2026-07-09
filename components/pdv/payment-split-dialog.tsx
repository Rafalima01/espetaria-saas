"use client"

import { useEffect, useState } from "react"
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
import { centsToBRL, brlToCents } from "@/lib/money"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"
import { CustomerPicker } from "@/components/fiado/customer-picker"

export type PaymentRow = { method: string; amount: number }
type PaymentRowDraft = { method: string; amountText: string }
type CreditCustomerLite = { id: string; name: string; phone: string; status: string; creditLimit: number }

const METHODS = ["PIX", "CASH", "CREDIT", "DEBIT", "VOUCHER", "FIADO"]

function centsToText(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",")
}

export function PaymentSplitDialog({
  open,
  onOpenChange,
  total,
  onConfirm,
  submitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: number
  onConfirm: (payments: PaymentRow[], creditCustomerId?: string) => void
  submitting: boolean
}) {
  const [rows, setRows] = useState<PaymentRowDraft[]>([
    { method: "PIX", amountText: centsToText(total) },
  ])
  const [creditCustomer, setCreditCustomer] = useState<CreditCustomerLite | null>(null)

  useEffect(() => {
    if (open) {
      setRows([{ method: "PIX", amountText: centsToText(total) }])
      setCreditCustomer(null)
    }
  }, [open])

  const parsedRows = rows.map((r) => ({ method: r.method, amount: brlToCents(r.amountText) }))
  const sum = parsedRows.reduce((s, r) => s + r.amount, 0)
  const matches = sum === total
  const hasFiado = rows.some((r) => r.method === "FIADO")
  const fiadoValid = !hasFiado || (creditCustomer && creditCustomer.status !== "BLOCKED")
  const canConfirm = matches && fiadoValid

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar venda</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Total a pagar: <span className="font-semibold text-foreground">{centsToBRL(total)}</span>
          </p>

          {rows.map((row, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={row.method}
                  onValueChange={(value) => {
                    setRows((r) => r.map((row2, i) => (i === idx ? { ...row2, method: value as string } : row2)))
                    if (value !== "FIADO") setCreditCustomer(null)
                  }}
                  items={Object.fromEntries(METHODS.map((m) => [m, PAYMENT_METHOD_LABELS[m]]))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => (
                      <SelectItem
                        key={m}
                        value={m}
                        disabled={m === "FIADO" && hasFiado && row.method !== "FIADO"}
                      >
                        {PAYMENT_METHOD_LABELS[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="0,00"
                  value={row.amountText}
                  onChange={(e) =>
                    setRows((r) =>
                      r.map((row2, i) =>
                        i === idx ? { ...row2, amountText: e.target.value } : row2
                      )
                    )
                  }
                  className="flex-1"
                />
                {rows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRows((r) => r.filter((_, i) => i !== idx))
                      if (row.method === "FIADO") setCreditCustomer(null)
                    }}
                  >
                    Remover
                  </Button>
                )}
              </div>
              {row.method === "FIADO" && (
                <CustomerPicker
                  selectedId={creditCustomer?.id}
                  onSelect={setCreditCustomer}
                />
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRows((r) => [...r, { method: "CASH", amountText: "" }])}
          >
            Adicionar forma de pagamento
          </Button>

          <p className={`text-sm ${matches ? "text-muted-foreground" : "text-destructive"}`}>
            Soma informada: {centsToBRL(sum)} {!matches && "— precisa ser igual ao total"}
          </p>
          {hasFiado && !creditCustomer && (
            <p className="text-sm text-destructive">Selecione um cliente para o pagamento fiado</p>
          )}
        </div>

        <DialogFooter>
          <Button
            disabled={!canConfirm || submitting}
            onClick={() => onConfirm(parsedRows, creditCustomer?.id)}
          >
            {submitting ? "Finalizando..." : "Confirmar pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
