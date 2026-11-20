"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StatusPill, type PillTone } from "@/components/ui/status-pill"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { centsToBRL } from "@/lib/money"
import { cn } from "@/lib/utils"
import {
  FINANCIAL_ENTRY_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  FIXED_COST_RECURRENCE_LABELS,
} from "@/lib/constants"

export type FixedCostEntryRow = {
  id: string
  description: string
  amount: number
  status: string
  dueDate: Date
  competencia: string | null
  fixedCost: {
    id: string
    name: string
    category: string
    paymentMethod: string | null
    recurrence: string
  } | null
  payments: { amount: number }[]
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Janeiro",
  "02": "Fevereiro",
  "03": "Março",
  "04": "Abril",
  "05": "Maio",
  "06": "Junho",
  "07": "Julho",
  "08": "Agosto",
  "09": "Setembro",
  "10": "Outubro",
  "11": "Novembro",
  "12": "Dezembro",
}

const STATUS_CHIPS: { id: string; label: string }[] = [
  { id: "ALL", label: "Todos" },
  { id: "PENDENTE", label: "Pendentes" },
  { id: "PAID", label: "Pagos" },
]

const SELECT_TRIGGER = "h-10 w-full rounded-xl bg-background sm:w-44"

export function FixedCostTable({ entries }: { entries: FixedCostEntryRow[] }) {
  const router = useRouter()
  const [year, setYear] = useState("ALL")
  const [month, setMonth] = useState("ALL")
  const [category, setCategory] = useState("ALL")
  const [status, setStatus] = useState("ALL")
  const [paymentMethod, setPaymentMethod] = useState("ALL")
  const [payingId, setPayingId] = useState<string | null>(null)

  const years = useMemo(
    () => Array.from(new Set(entries.map((e) => e.competencia?.slice(0, 4)).filter((v): v is string => !!v))).sort().reverse(),
    [entries]
  )
  const categories = useMemo(
    () => Array.from(new Set(entries.map((e) => e.fixedCost?.category).filter((v): v is string => !!v))).sort(),
    [entries]
  )

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (year !== "ALL" && e.competencia?.slice(0, 4) !== year) return false
      if (month !== "ALL" && e.competencia?.slice(5, 7) !== month) return false
      if (category !== "ALL" && e.fixedCost?.category !== category) return false
      if (status === "PENDENTE" && !["OPEN", "PARTIALLY_PAID"].includes(e.status)) return false
      if (status === "PAID" && e.status !== "PAID") return false
      if (paymentMethod !== "ALL" && e.fixedCost?.paymentMethod !== paymentMethod) return false
      return true
    })
  }, [entries, year, month, category, status, paymentMethod])

  async function handleMarkPaid(entry: FixedCostEntryRow) {
    const remaining = entry.amount - entry.payments.reduce((s, p) => s + p.amount, 0)
    if (remaining <= 0) return
    setPayingId(entry.id)
    try {
      const res = await fetch(`/api/financial-entries/${entry.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: remaining, method: entry.fixedCost?.paymentMethod ?? "CASH" }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao marcar como pago")
        return
      }
      toast.success("Marcado como pago")
      router.refresh()
    } finally {
      setPayingId(null)
    }
  }

  return (
    <Card className="gap-0 p-0">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filtro por situação">
          {STATUS_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              role="tab"
              aria-selected={status === chip.id}
              onClick={() => setStatus(chip.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
                status === chip.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Select
            value={year}
            onValueChange={(v) => v && setYear(v)}
            items={{ ALL: "Todos os anos", ...Object.fromEntries(years.map((y) => [y, y])) }}
          >
            <SelectTrigger className="h-10 w-full rounded-xl bg-background sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os anos</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={month}
            onValueChange={(v) => v && setMonth(v)}
            items={{ ALL: "Todos os meses", ...MONTH_LABELS }}
          >
            <SelectTrigger className={SELECT_TRIGGER}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os meses</SelectItem>
              {Object.entries(MONTH_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={category}
            onValueChange={(v) => v && setCategory(v)}
            items={{ ALL: "Todas as categorias", ...Object.fromEntries(categories.map((c) => [c, c])) }}
          >
            <SelectTrigger className={SELECT_TRIGGER}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={paymentMethod}
            onValueChange={(v) => v && setPaymentMethod(v)}
            items={{ ALL: "Todas as formas", ...PAYMENT_METHOD_LABELS }}
          >
            <SelectTrigger className={SELECT_TRIGGER}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as formas</SelectItem>
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
      </div>

      {filtered.length === 0 ? (
        <p className="border-t border-border p-10 text-center text-sm text-muted-foreground">
          Nenhuma despesa fixa encontrada.
        </p>
      ) : (
        <div className="border-t border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Competência</TableHead>
                <TableHead>Despesa</TableHead>
                <TableHead>Recorrência</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => {
                const overdue =
                  entry.status !== "PAID" && entry.status !== "CANCELLED" && new Date(entry.dueDate) < new Date()
                const pending = ["OPEN", "PARTIALLY_PAID"].includes(entry.status)
                const tone: PillTone =
                  entry.status === "PAID" ? "success" : overdue ? "danger" : entry.status === "CANCELLED" ? "neutral" : "warning"
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {entry.competencia ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {entry.fixedCost ? (
                          <Link
                            href={`/financeiro/despesas-fixas/${entry.fixedCost.id}/editar`}
                            className="font-medium underline-offset-4 hover:underline"
                          >
                            {entry.fixedCost.name}
                          </Link>
                        ) : (
                          <span className="font-medium">{entry.description}</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {entry.fixedCost?.category ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.fixedCost
                        ? FIXED_COST_RECURRENCE_LABELS[entry.fixedCost.recurrence] ?? entry.fixedCost.recurrence
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {centsToBRL(entry.amount)}
                    </TableCell>
                    <TableCell className={cn(overdue ? "font-medium text-destructive" : "text-muted-foreground")}>
                      {new Date(entry.dueDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <StatusPill tone={tone}>
                        {overdue && entry.status !== "PAID"
                          ? "Vencido"
                          : FINANCIAL_ENTRY_STATUS_LABELS[entry.status] ?? entry.status}
                      </StatusPill>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        {pending && (
                          <Button
                            size="sm"
                            className="h-8 rounded-lg px-3"
                            disabled={payingId === entry.id}
                            onClick={() => handleMarkPaid(entry)}
                          >
                            <Check className="size-3.5" />
                            {payingId === entry.id ? "Salvando..." : "Marcar como pago"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  )
}
