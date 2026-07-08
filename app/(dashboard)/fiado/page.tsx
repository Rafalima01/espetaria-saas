import Link from "next/link"
import { DollarSign, TrendingUp, AlertTriangle, Users, Wallet } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCustomerBalance } from "@/lib/fiado/getCustomerBalance"
import { getFiadoDashboardSummary } from "@/lib/dashboard/getFiadoSummary"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { centsToBRL } from "@/lib/money"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function FiadoPage() {
  const [customers, summary] = await Promise.all([
    prisma.creditCustomer.findMany({ orderBy: { name: "asc" } }),
    getFiadoDashboardSummary(),
  ])
  const withBalance = await Promise.all(
    customers.map(async (c) => ({ ...c, balance: (await getCustomerBalance(prisma, c.id)).balance }))
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Fiado</h1>
          <p className="text-muted-foreground">{customers.length} cliente(s) cadastrado(s)</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            render={<Link href="/fiado/relatorios" />}
            nativeButton={false}
          >
            Relatórios
          </Button>
          <Button render={<Link href="/fiado/clientes/novo" />} nativeButton={false}>
            Novo cliente
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard title="Total vendido fiado" value={centsToBRL(summary.totalVendido)} icon={DollarSign} />
        <SummaryCard title="Total recebido" value={centsToBRL(summary.totalRecebido)} icon={TrendingUp} />
        <SummaryCard title="Total pendente" value={centsToBRL(summary.totalPendente)} icon={Wallet} />
        <SummaryCard title="Clientes inadimplentes" value={String(summary.inadimplentes)} icon={AlertTriangle} />
        <SummaryCard title="Clientes em dia" value={String(summary.emDia)} icon={Users} />
        <SummaryCard title="Maior devedor" value={summary.maiorDevedor} icon={Users} />
        <SummaryCard title="Quantidade de clientes" value={String(summary.quantidadeClientes)} icon={Users} />
        <SummaryCard title="Valor médio em aberto" value={centsToBRL(summary.valorMedioEmAberto)} icon={Wallet} />
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Saldo devedor</TableHead>
              <TableHead>Limite</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withBalance.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                <TableCell className={c.balance > c.creditLimit ? "font-semibold text-destructive" : ""}>
                  {centsToBRL(c.balance)}
                </TableCell>
                <TableCell className="text-muted-foreground">{centsToBRL(c.creditLimit)}</TableCell>
                <TableCell>
                  <Badge variant={c.status === "BLOCKED" ? "destructive" : "default"}>
                    {c.status === "BLOCKED" ? "Bloqueado" : "Ativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    render={<Link href={`/fiado/clientes/${c.id}`} />}
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                  >
                    Ver detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  Nenhum cliente cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
