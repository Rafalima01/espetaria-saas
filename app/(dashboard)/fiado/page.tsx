import Link from "next/link"
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  Wallet,
  Crown,
  CheckCircle2,
  FileText,
  UserPlus,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { getCustomerBalance } from "@/lib/fiado/getCustomerBalance"
import { getFiadoDashboardSummary } from "@/lib/dashboard/getFiadoSummary"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { CustomerTable } from "@/components/fiado/customer-table"
import { centsToBRL } from "@/lib/money"

export default async function FiadoPage() {
  const [customers, summary] = await Promise.all([
    prisma.creditCustomer.findMany({ orderBy: { name: "asc" } }),
    getFiadoDashboardSummary(),
  ])
  const withBalance = await Promise.all(
    customers.map(async (c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      status: c.status,
      creditLimit: c.creditLimit,
      balance: (await getCustomerBalance(prisma, c.id)).balance,
    }))
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fiado"
        description={`${customers.length} cliente(s) cadastrado(s)`}
        actions={
          <>
            <Button
              variant="outline"
              className="h-10 rounded-xl px-4"
              render={<Link href="/fiado/relatorios" />}
              nativeButton={false}
            >
              <FileText className="size-4" />
              Relatórios
            </Button>
            <Button
              className="h-10 rounded-xl px-4"
              render={<Link href="/fiado/clientes/novo" />}
              nativeButton={false}
            >
              <UserPlus className="size-4" />
              Novo cliente
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          highlight
          title="Total pendente"
          value={centsToBRL(summary.totalPendente)}
          icon={Wallet}
        />
        <SummaryCard title="Total vendido fiado" value={centsToBRL(summary.totalVendido)} icon={DollarSign} />
        <SummaryCard title="Total recebido" value={centsToBRL(summary.totalRecebido)} icon={TrendingUp} />
        <SummaryCard
          title="Valor médio em aberto"
          value={centsToBRL(summary.valorMedioEmAberto)}
          icon={Wallet}
        />
        <SummaryCard
          title="Clientes inadimplentes"
          value={String(summary.inadimplentes)}
          icon={AlertTriangle}
        />
        <SummaryCard title="Clientes em dia" value={String(summary.emDia)} icon={CheckCircle2} />
        <SummaryCard title="Maior devedor" value={summary.maiorDevedor} icon={Crown} />
        <SummaryCard
          title="Quantidade de clientes"
          value={String(summary.quantidadeClientes)}
          icon={Users}
        />
      </div>

      <CustomerTable customers={withBalance} />
    </div>
  )
}
