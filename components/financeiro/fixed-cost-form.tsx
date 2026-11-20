"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PAYMENT_METHOD_LABELS,
  FIXED_COST_RECURRENCE_LABELS,
  FIXED_COST_MONTH_FAMILY_RECURRENCES,
} from "@/lib/constants"
import { brlToCents } from "@/lib/money"
import { cn } from "@/lib/utils"
import type { FixedCost } from "@/lib/generated/prisma/client"

const NO_PAYMENT_METHOD = "__none__"
const FIELD_INPUT = "h-10 rounded-xl bg-background"

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string
  htmlFor: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

export function FixedCostForm({
  fixedCost,
  categories,
}: {
  fixedCost?: FixedCost
  categories: string[]
}) {
  const router = useRouter()
  const isEdit = !!fixedCost
  const [submitting, setSubmitting] = useState(false)
  const [category, setCategory] = useState(fixedCost?.category ?? categories[0] ?? "")
  const [paymentMethod, setPaymentMethod] = useState(fixedCost?.paymentMethod ?? NO_PAYMENT_METHOD)
  const [recurrence, setRecurrence] = useState(fixedCost?.recurrence ?? "MONTHLY")
  const isMonthFamily = (FIXED_COST_MONTH_FAMILY_RECURRENCES as readonly string[]).includes(recurrence)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const form = new FormData(e.currentTarget)
      const payload = {
        name: String(form.get("name") ?? ""),
        category,
        amount: brlToCents(String(form.get("amount") ?? "0")),
        recurrence,
        dueDay: isMonthFamily ? Number(form.get("dueDay") ?? 1) : undefined,
        paymentMethod: paymentMethod === NO_PAYMENT_METHOD ? undefined : paymentMethod,
        notes: String(form.get("notes") ?? ""),
        active: form.get("active") === "on",
      }

      const url = isEdit ? `/api/fixed-costs/${fixedCost.id}` : "/api/fixed-costs"
      const method = isEdit ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error?.formErrors?.[0] ?? data.error ?? "Erro ao salvar custo fixo")
        return
      }

      toast.success(isEdit ? "Custo fixo atualizado" : "Custo fixo cadastrado")
      router.push("/financeiro/despesas-fixas")
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Despesa</CardTitle>
            <CardDescription>O que é e quanto custa a cada vencimento</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" htmlFor="name" className="sm:col-span-2">
              <Input id="name" name="name" className={FIELD_INPUT} defaultValue={fixedCost?.name} required />
            </Field>

            <Field label="Categoria" htmlFor="category">
              <Select
                value={category}
                onValueChange={(v) => v && setCategory(v)}
                items={Object.fromEntries(categories.map((c) => [c, c]))}
                required
              >
                <SelectTrigger id="category" className="h-10 w-full rounded-xl">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Valor (R$)" htmlFor="amount">
              <Input
                id="amount"
                name="amount"
                inputMode="decimal"
                className={FIELD_INPUT}
                defaultValue={fixedCost ? (fixedCost.amount / 100).toFixed(2).replace(".", ",") : ""}
                placeholder="0,00"
                required
              />
            </Field>

            <Field label="Observações" htmlFor="notes" className="sm:col-span-2">
              <Textarea
                id="notes"
                name="notes"
                className="min-h-24 rounded-xl bg-background"
                defaultValue={fixedCost?.notes ?? ""}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recorrência e pagamento</CardTitle>
            <CardDescription>As cobranças de cada período são geradas automaticamente</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Recorrência" htmlFor="recurrence">
              <Select
                value={recurrence}
                onValueChange={(v) => v && setRecurrence(v)}
                items={FIXED_COST_RECURRENCE_LABELS}
              >
                <SelectTrigger id="recurrence" className="h-10 w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FIXED_COST_RECURRENCE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {isMonthFamily && (
              <Field label="Dia de vencimento" htmlFor="dueDay">
                <Input
                  id="dueDay"
                  name="dueDay"
                  type="number"
                  min={1}
                  max={31}
                  className={FIELD_INPUT}
                  defaultValue={fixedCost?.dueDay ?? 5}
                  required
                />
              </Field>
            )}

            <Field label="Forma de pagamento" htmlFor="paymentMethod">
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v ?? NO_PAYMENT_METHOD)}
                items={{ [NO_PAYMENT_METHOD]: "Não definida", ...PAYMENT_METHOD_LABELS }}
              >
                <SelectTrigger id="paymentMethod" className="h-10 w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PAYMENT_METHOD}>Não definida</SelectItem>
                  {Object.entries(PAYMENT_METHOD_LABELS)
                    .filter(([value]) => value !== "FIADO")
                    .map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-0">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="active" name="active" defaultChecked={fixedCost?.active ?? true} />
              <Label htmlFor="active">Custo fixo ativo</Label>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                loading={submitting}
                className="h-11 rounded-xl text-base font-semibold"
              >
                {submitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar custo fixo"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-xl"
                onClick={() => router.push("/financeiro/despesas-fixas")}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
