"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { centsToBRL } from "@/lib/money"
import { FINANCIAL_ENTRY_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants"

export type FixedCostEntryRow = {
  id: string
  description: string
  amount: number
  status: string
  dueDate: Date
  competencia: string | null
  fixedCost: { id: string; name: string; category: string; paymentMethod: string | null } | null
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

const STATUS_FILTER_LABELS: Record<string, string> = {
  ALL: "Todos os status",
  PENDENTE: "Pendente",
  PAID: "Pago",
}

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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Select
          value={year}
          onValueChange={(v) => v && setYear(v)}
          items={{ ALL: "Todos os anos", ...Object.fromEntries(years.map((y) => [y, y])) }}
        >
          <SelectTrigger className="w-full sm:w-36">
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
          <SelectTrigger className="w-full sm:w-40">
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
          <SelectTrigger className="w-full sm:w-48">
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
        <Select value={status} onValueChange={(v) => v && setStatus(v)} items={STATUS_FILTER_LABELS}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_FILTER_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={paymentMethod}
          onValueChange={(v) => v && setPaymentMethod(v)}
          items={{ ALL: "Todas as formas", ...PAYMENT_METHOD_LABELS }}
        >
          <SelectTrigger className="w-full sm:w-44">
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

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma despesa fixa encontrada.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competência</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
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
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {entry.competencia ?? "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {entry.fixedCost ? (
                        <Link href={`/financeiro/despesas-fixas/${entry.fixedCost.id}/editar`} className="hover:underline">
                          {entry.fixedCost.name}
                        </Link>
                      ) : (
                        entry.description
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{entry.fixedCost?.category ?? "-"}</TableCell>
                    <TableCell>{centsToBRL(entry.amount)}</TableCell>
                    <TableCell className={overdue ? "font-medium text-destructive" : "text-muted-foreground"}>
                      {new Date(entry.dueDate).toLocaleDateString("pt-BR")}
                      {overdue && " (vencido)"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.status === "PAID" ? "default" : overdue ? "destructive" : "secondary"}>
                        {FINANCIAL_ENTRY_STATUS_LABELS[entry.status] ?? entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {pending && (
                        <Button size="sm" disabled={payingId === entry.id} onClick={() => handleMarkPaid(entry)}>
                          {payingId === entry.id ? "Salvando..." : "Marcar como pago"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
