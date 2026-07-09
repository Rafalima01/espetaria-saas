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
import { Card, CardContent } from "@/components/ui/card"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"
import { brlToCents } from "@/lib/money"
import type { FixedCost } from "@/lib/generated/prisma/client"

const NO_PAYMENT_METHOD = "__none__"

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const form = new FormData(e.currentTarget)
      const payload = {
        name: String(form.get("name") ?? ""),
        category,
        monthlyAmount: brlToCents(String(form.get("monthlyAmount") ?? "0")),
        dueDay: Number(form.get("dueDay") ?? 1),
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
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" defaultValue={fixedCost?.name} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={category}
              onValueChange={(v) => v && setCategory(v)}
              items={Object.fromEntries(categories.map((c) => [c, c]))}
              required
            >
              <SelectTrigger id="category" className="w-full">
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
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="monthlyAmount">Valor mensal (R$)</Label>
            <Input
              id="monthlyAmount"
              name="monthlyAmount"
              inputMode="decimal"
              defaultValue={
                fixedCost ? (fixedCost.monthlyAmount / 100).toFixed(2).replace(".", ",") : ""
              }
              placeholder="0,00"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="dueDay">Dia de vencimento</Label>
            <Input
              id="dueDay"
              name="dueDay"
              type="number"
              min={1}
              max={31}
              defaultValue={fixedCost?.dueDay ?? 5}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="paymentMethod">Forma de pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v ?? NO_PAYMENT_METHOD)}
              items={{ [NO_PAYMENT_METHOD]: "Não definida", ...PAYMENT_METHOD_LABELS }}
            >
              <SelectTrigger id="paymentMethod" className="w-full">
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
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="notes" defaultValue={fixedCost?.notes ?? ""} />
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox id="active" name="active" defaultChecked={fixedCost?.active ?? true} />
            <Label htmlFor="active">Custo fixo ativo</Label>
          </div>

          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar custo fixo"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/financeiro/despesas-fixas")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
