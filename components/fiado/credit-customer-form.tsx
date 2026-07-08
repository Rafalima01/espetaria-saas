"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { brlToCents } from "@/lib/money"
import type { CreditCustomer } from "@/lib/generated/prisma/client"

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
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" defaultValue={customer?.name} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" defaultValue={customer?.phone} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" defaultValue={customer?.whatsapp ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" name="cpf" defaultValue={customer?.cpf ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="creditLimit">Limite de crédito (R$)</Label>
            <Input
              id="creditLimit"
              name="creditLimit"
              inputMode="decimal"
              defaultValue={
                customer ? (customer.creditLimit / 100).toFixed(2).replace(".", ",") : ""
              }
              placeholder="0,00"
              required
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" name="address" defaultValue={customer?.address ?? ""} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="notes" defaultValue={customer?.notes ?? ""} />
          </div>
          {isEdit && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus((v as "ACTIVE" | "BLOCKED") ?? "ACTIVE")}
                items={{ ACTIVE: "Ativo", BLOCKED: "Bloqueado" }}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="BLOCKED">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar cliente"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/fiado")}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
