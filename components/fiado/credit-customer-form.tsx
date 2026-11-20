"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { brlToCents } from "@/lib/money"
import { cn } from "@/lib/utils"
import type { CreditCustomer } from "@/lib/generated/prisma/client"

const FIELD_INPUT = "h-10 rounded-xl bg-background"

function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function CreditCustomerForm({ customer }: { customer?: CreditCustomer }) {
  const router = useRouter()
  const isEdit = !!customer
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(customer?.status ?? "ACTIVE")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const form = new FormData(e.currentTarget)
      const payload = {
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        whatsapp: String(form.get("whatsapp") ?? ""),
        cpf: String(form.get("cpf") ?? ""),
        address: String(form.get("address") ?? ""),
        notes: String(form.get("notes") ?? ""),
        creditLimit: brlToCents(String(form.get("creditLimit") ?? "0")),
        status,
      }

      const url = isEdit ? `/api/credit-customers/${customer.id}` : "/api/credit-customers"
      const method = isEdit ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error?.formErrors?.[0] ?? data.error ?? "Erro ao salvar cliente")
        return
      }
      toast.success(isEdit ? "Cliente atualizado" : "Cliente cadastrado")
      router.push(isEdit ? `/fiado/clientes/${customer.id}` : `/fiado/clientes/${data.id}`)
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do cliente</CardTitle>
          <CardDescription>Contato e informações para cobrança</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor="name" className="sm:col-span-2">
            <Input id="name" name="name" className={FIELD_INPUT} defaultValue={customer?.name} required />
          </Field>
          <Field label="Telefone" htmlFor="phone">
            <Input id="phone" name="phone" className={FIELD_INPUT} defaultValue={customer?.phone} required />
          </Field>
          <Field label="WhatsApp" htmlFor="whatsapp">
            <Input
              id="whatsapp"
              name="whatsapp"
              className={FIELD_INPUT}
              defaultValue={customer?.whatsapp ?? ""}
            />
          </Field>
          <Field label="CPF" htmlFor="cpf">
            <Input id="cpf" name="cpf" className={FIELD_INPUT} defaultValue={customer?.cpf ?? ""} />
          </Field>
          <Field label="Endereço" htmlFor="address">
            <Input id="address" name="address" className={FIELD_INPUT} defaultValue={customer?.address ?? ""} />
          </Field>
          <Field label="Observações" htmlFor="notes" className="sm:col-span-2">
            <Textarea
              id="notes"
              name="notes"
              className="min-h-24 rounded-xl bg-background"
              defaultValue={customer?.notes ?? ""}
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 lg:sticky lg:top-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crédito</CardTitle>
            <CardDescription>Quanto este cliente pode dever</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field
              label="Limite de crédito (R$)"
              htmlFor="creditLimit"
              hint="Passar do limite só gera um aviso no PDV; não impede a venda."
            >
              <Input
                id="creditLimit"
                name="creditLimit"
                inputMode="decimal"
                className={FIELD_INPUT}
                defaultValue={
                  customer ? (customer.creditLimit / 100).toFixed(2).replace(".", ",") : ""
                }
                placeholder="0,00"
                required
              />
            </Field>

            {isEdit && (
              <div className="flex flex-col gap-2">
                <Label id="status-label">Status</Label>
                <div className="flex gap-1.5" role="radiogroup" aria-labelledby="status-label">
                  {(
                    [
                      { id: "ACTIVE", label: "Ativo" },
                      { id: "BLOCKED", label: "Bloqueado" },
                    ] as const
                  ).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={status === s.id}
                      onClick={() => setStatus(s.id)}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        status === s.id
                          ? s.id === "BLOCKED"
                            ? "bg-destructive text-white"
                            : "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cliente bloqueado não consegue comprar no fiado.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-2">
            <Button
              type="submit"
              loading={submitting}
              className="h-11 rounded-xl text-base font-semibold"
            >
              {submitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar cliente"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-xl"
              onClick={() => router.push(isEdit ? `/fiado/clientes/${customer.id}` : "/fiado")}
            >
              Cancelar
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
