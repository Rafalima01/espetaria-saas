"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/ui/status-pill"
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
      <div className="flex flex-col gap-2 rounded-xl bg-background p-3 ring-1 ring-foreground/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-primary">
              {selected.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-medium">{selected.name}</p>
              <p className="text-xs text-muted-foreground">{selected.phone}</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
            Trocar
          </Button>
        </div>
        {balance && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground tabular-nums">
              Saldo devedor: {centsToBRL(balance.balance)} / limite {centsToBRL(balance.creditLimit)}
            </span>
            {balance.overLimit && <StatusPill tone="danger">Acima do limite</StatusPill>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-10 rounded-xl bg-background pl-9"
          placeholder="Buscar cliente por nome ou telefone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {results.length > 0 && (
        <div className="flex flex-col overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10">
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              className="flex items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50"
              disabled={c.status === "BLOCKED"}
              onClick={() => selectCustomer(c)}
            >
              <span>
                {c.name} <span className="text-muted-foreground">· {c.phone}</span>
              </span>
              {c.status === "BLOCKED" && <StatusPill tone="danger">Bloqueado</StatusPill>}
            </button>
          ))}
        </div>
      )}
      {query.trim().length >= 2 && results.length === 0 && !showQuickCreate && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit rounded-lg"
          onClick={() => setShowQuickCreate(true)}
        >
          Nenhum encontrado: cadastrar &quot;{query}&quot;
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-xl bg-background p-3 ring-1 ring-foreground/10"
    >
      <Input name="name" placeholder="Nome" className="h-9 rounded-lg" defaultValue={initialName} required />
      <Input name="phone" placeholder="Telefone" className="h-9 rounded-lg" required />
      <Input name="creditLimit" placeholder="Limite de crédito (R$)" className="h-9 rounded-lg" />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="rounded-lg" loading={submitting}>
          {submitting ? "Salvando..." : "Cadastrar"}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
