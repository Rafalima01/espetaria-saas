import { ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { PageHeader } from "@/components/layout/page-header"
import { FinanceiroNav } from "@/components/financeiro/financeiro-nav"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { StatusPill } from "@/components/ui/status-pill"
import { getCashFlow } from "@/lib/dashboard/getCashFlow"
import { ensureFixedCostEntries } from "@/lib/financeiro/ensureFixedCostEntries"
import { centsToBRL } from "@/lib/money"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function FluxoDeCaixaPage() {
  await ensureFixedCostEntries()
  const { totalIn, totalOut, balance, entries } = await getCashFlow()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Financeiro" description="Custos fixos, fluxo de caixa e relatórios" />

      <FinanceiroNav />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          highlight={balance >= 0}
          title="Saldo do mês"
          value={centsToBRL(balance)}
          icon={Scale}
          hint="Entradas menos saídas do mês atual"
        />
        <SummaryCard title="Entradas do mês" value={centsToBRL(totalIn)} icon={ArrowUpCircle} />
        <SummaryCard title="Saídas do mês" value={centsToBRL(totalOut)} icon={ArrowDownCircle} />
      </div>

      {entries.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Nenhuma movimentação registrada neste mês.
        </Card>
      ) : (
        <Card className="gap-0 p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={`${entry.direction}-${entry.id}`}>
                  <TableCell className="text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>
                    <StatusPill tone={entry.direction === "IN" ? "success" : "danger"}>
                      {entry.direction === "IN" ? "Entrada" : "Saída"}
                    </StatusPill>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium tabular-nums",
                      entry.direction === "IN" ? "text-success" : "text-destructive"
                    )}
                  >
                    {entry.direction === "IN" ? "+" : "-"}
                    {centsToBRL(entry.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
