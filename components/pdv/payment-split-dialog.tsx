"use client"

import { useEffect, useState } from "react"
import { Plus, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { centsToBRL, brlToCents } from "@/lib/money"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
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
  const diff = total - sum
  const matches = diff === 0
  const hasFiado = rows.some((r) => r.method === "FIADO")
  const fiadoValid = !hasFiado || (creditCustomer && creditCustomer.status !== "BLOCKED")
  const canConfirm = matches && fiadoValid

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Finalizar venda</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between rounded-2xl bg-secondary/60 p-4">
            <span className="text-sm text-muted-foreground">Total a pagar</span>
            <span className="text-3xl font-semibold tracking-tight text-primary tabular-nums">
              {centsToBRL(total)}
            </span>
          </div>

          {rows.map((row, idx) => (
            <div key={idx} className="flex flex-col gap-3 rounded-2xl bg-secondary/60 p-3">
              <div className="flex items-center gap-2">
                <div className="flex flex-1 flex-wrap gap-1.5" role="radiogroup" aria-label="Forma de pagamento">
                  {METHODS.map((m) => {
                    const active = row.method === m
                    const disabled = m === "FIADO" && hasFiado && !active
                    return (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={disabled}
                        onClick={() => {
                          setRows((r) => r.map((row2, i) => (i === idx ? { ...row2, method: m } : row2)))
                          if (m !== "FIADO" && row.method === "FIADO") setCreditCustomer(null)
                        }}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground ring-1 ring-foreground/10 hover:text-foreground"
                        )}
                      >
                        {PAYMENT_METHOD_LABELS[m]}
                      </button>
                    )
                  })}
                </div>
                {rows.length > 1 && (
                  <button
                    type="button"
                    aria-label="Remover forma de pagamento"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-destructive/15 hover:text-destructive focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() => {
                      setRows((r) => r.filter((_, i) => i !== idx))
                      if (row.method === "FIADO") setCreditCustomer(null)
                    }}
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <Input
                aria-label={`Valor em ${PAYMENT_METHOD_LABELS[row.method]}`}
                placeholder="0,00"
                value={row.amountText}
                onChange={(e) =>
                  setRows((r) =>
                    r.map((row2, i) => (i === idx ? { ...row2, amountText: e.target.value } : row2))
                  )
                }
                className="h-10 rounded-xl bg-background text-base tabular-nums"
              />
              {row.method === "FIADO" && (
                <CustomerPicker selectedId={creditCustomer?.id} onSelect={setCreditCustomer} />
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() =>
              setRows((r) => [
                ...r,
                { method: "CASH", amountText: diff > 0 ? centsToText(diff) : "" },
              ])
            }
          >
            <Plus className="size-4" />
            Dividir em outra forma
          </Button>

          <p
            className={cn(
              "text-sm tabular-nums",
              matches ? "text-success" : "text-destructive"
            )}
          >
            {matches
              ? "Pagamento confere com o total"
              : diff > 0
                ? `Faltam ${centsToBRL(diff)}`
                : `Passou ${centsToBRL(-diff)} do total`}
          </p>
          {hasFiado && !creditCustomer && (
            <p className="text-sm text-destructive">Selecione um cliente para o pagamento fiado</p>
          )}
        </div>

        <DialogFooter>
          <Button
            className="h-11 w-full rounded-xl text-base font-semibold sm:w-auto"
            loading={submitting}
            disabled={!canConfirm}
            onClick={() => onConfirm(parsedRows, creditCustomer?.id)}
          >
            {submitting ? "Finalizando..." : "Confirmar pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
