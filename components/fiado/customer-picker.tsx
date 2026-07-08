"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { centsToBRL, brlToCents } from "@/lib/money"

type CreditCustomer = {
  id: string
  name: string
  phone: string
  status: string
  creditLimit: number
}

type Balance = { balance: number; creditLimit: number; overLimit: boolean; status: string }

export function CustomerPicker({
  selectedId,
  onSelect,
}: {
  selectedId?: string
  onSelect: (customer: CreditCustomer | null) => void
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CreditCustomer[]>([])
  const [selected, setSelected] = useState<CreditCustomer | null>(null)
  const [balance, setBalance] = useState<Balance | null>(null)
  const [showQuickCreate, setShowQuickCreate] = useState(false)

  useEffect(() => {
    if (selectedId || query.trim().length < 2) {
      setResults([])
      return
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/credit-customers?search=${encodeURIComponent(query)}`)
      if (res.ok) setResults(await res.json())
    }, 250)
    return () => clearTimeout(timeout)
  }, [query, selectedId])

  useEffect(() => {
    if (!selected) {
      setBalance(null)
      return
    }
    fetch(`/api/credit-customers/${selected.id}/balance`)
      .then((r) => r.json())
      .then(setBalance)
  }, [selected])

  function selectCustomer(customer: CreditCustomer) {
    setSelected(customer)
    setQuery("")
    setResults([])
    onSelect(customer)
  }

  function clearSelection() {
    setSelected(null)
    setBalance(null)
    onSelect(null)
  }

  if (selected) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{selected.name}</p>
            <p className="text-xs text-muted-foreground">{selected.phone}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
            Trocar
          </Button>
        </div>
        {balance && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">
              Saldo devedor: {centsToBRL(balance.balance)} / limite {centsToBRL(balance.creditLimit)}
            </span>
            {balance.overLimit && <Badge variant="destructive">Acima do limite</Badge>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="Buscar cliente por nome ou telefone..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <div className="flex flex-col gap-1 rounded-lg border">
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              className="flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
              disabled={c.status === "BLOCKED"}
              onClick={() => selectCustomer(c)}
            >
              <span>
                {c.name} — {c.phone}
              </span>
              {c.status === "BLOCKED" && <Badge variant="destructive">Bloqueado</Badge>}
            </button>
          ))}
        </div>
      )}
      {query.trim().length >= 2 && results.length === 0 && !showQuickCreate && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => setShowQuickCreate(true)}
        >
          Nenhum encontrado — cadastrar &quot;{query}&quot;
        </Button>
      )}
      {showQuickCreate && (
        <QuickCreateForm
          initialName={query}
          onCreated={(c) => {
            setShowQuickCreate(false)
            selectCustomer(c)
          }}
          onCancel={() => setShowQuickCreate(false)}
        />
      )}
    </div>
  )
}

function QuickCreateForm({
  initialName,
  onCreated,
  onCancel,
}: {
  initialName: string
  onCreated: (customer: CreditCustomer) => void
  onCancel: () => void
}) {
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const form = new FormData(e.currentTarget)
      const payload = {
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        creditLimit: brlToCents(String(form.get("creditLimit") ?? "0")),
      }
      const res = await fetch("/api/credit-customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao cadastrar cliente")
        return
      }
      toast.success("Cliente cadastrado")
      onCreated(data)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 pt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Input name="name" placeholder="Nome" defaultValue={initialName} required />
          <Input name="phone" placeholder="Telefone" required />
          <Input name="creditLimit" placeholder="Limite de crédito (R$)" />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Salvando..." : "Cadastrar"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
