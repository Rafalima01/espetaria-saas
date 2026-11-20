import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { StatusPill, type PillTone } from "@/components/ui/status-pill"
import { centsToBRL } from "@/lib/money"
import { FINANCIAL_ENTRY_STATUS_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

type Entry = {
  id: string
  description: string
  amount: number
  status: string
  dueDate: Date
  createdAt: Date
  payments: { id: string; amount: number; createdAt: Date }[]
}

const STATUS_TONE: Record<string, PillTone> = {
  OPEN: "warning",
  PARTIALLY_PAID: "primary",
  PAID: "success",
  CANCELLED: "danger",
}

export function StatementTable({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-muted-foreground">
        Nenhuma movimentação registrada.
      </Card>
    )
  }

  return (
    <Card className="gap-0 p-0">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Pago</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const paid = entry.payments.reduce((sum, p) => sum + p.amount, 0)
            const overdue =
              entry.status !== "PAID" &&
              entry.status !== "CANCELLED" &&
              new Date(entry.dueDate) < new Date()
            return (
              <TableRow key={entry.id}>
                <TableCell className="text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {centsToBRL(entry.amount)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  {centsToBRL(paid)}
                </TableCell>
                <TableCell
                  className={cn(overdue ? "font-medium text-destructive" : "text-muted-foreground")}
                >
                  {new Date(entry.dueDate).toLocaleDateString("pt-BR")}
                  {overdue && " (vencido)"}
                </TableCell>
                <TableCell>
                  <StatusPill tone={STATUS_TONE[entry.status] ?? "neutral"}>
                    {FINANCIAL_ENTRY_STATUS_LABELS[entry.status] ?? entry.status}
                  </StatusPill>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
