import { ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { FinanceiroNav } from "@/components/financeiro/financeiro-nav"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getCashFlow } from "@/lib/dashboard/getCashFlow"
import { ensureFixedCostEntries } from "@/lib/financeiro/ensureFixedCostEntries"
import { centsToBRL } from "@/lib/money"

export const dynamic = "force-dynamic"

export default async function FluxoDeCaixaPage() {
  await ensureFixedCostEntries()
  const { totalIn, totalOut, balance, entries } = await getCashFlow()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Financeiro</h1>
        <p className="text-muted-foreground">Custos fixos, fluxo de caixa e relatórios</p>
      </div>

      <FinanceiroNav />

      <div>
        <h2 className="text-lg font-medium">Fluxo de Caixa</h2>
        <p className="text-sm text-muted-foreground">Entradas e saídas do mês atual</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard title="Entradas do mês" value={centsToBRL(totalIn)} icon={ArrowUpCircle} />
        <SummaryCard title="Saídas do mês" value={centsToBRL(totalOut)} icon={ArrowDownCircle} />
        <SummaryCard title="Saldo do mês" value={centsToBRL(balance)} icon={Scale} />
      </div>

      {entries.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma movimentação registrada neste mês.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={`${entry.direction}-${entry.id}`}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {entry.direction === "IN" ? "Entrada" : "Saída"}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${entry.direction === "IN" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
                  >
                    {entry.direction === "IN" ? "+" : "-"}
                    {centsToBRL(entry.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
