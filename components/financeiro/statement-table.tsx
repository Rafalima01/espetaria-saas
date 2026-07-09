import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { centsToBRL } from "@/lib/money"
import { FINANCIAL_ENTRY_STATUS_LABELS } from "@/lib/constants"

type Entry = {
  id: string
  description: string
  amount: number
  status: string
  dueDate: Date
  createdAt: Date
  payments: { id: string; amount: number; createdAt: Date }[]
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  OPEN: "secondary",
  PARTIALLY_PAID: "secondary",
  PAID: "default",
  CANCELLED: "destructive",
}

export function StatementTable({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground">Nenhuma movimentação registrada.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Pago</TableHead>
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
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell className="font-medium">{centsToBRL(entry.amount)}</TableCell>
                <TableCell className="text-muted-foreground">{centsToBRL(paid)}</TableCell>
                <TableCell className={overdue ? "font-medium text-destructive" : "text-muted-foreground"}>
                  {new Date(entry.dueDate).toLocaleDateString("pt-BR")}
                  {overdue && " (vencido)"}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[entry.status] ?? "secondary"}>
                    {FINANCIAL_ENTRY_STATUS_LABELS[entry.status] ?? entry.status}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
