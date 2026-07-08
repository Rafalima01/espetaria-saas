import { prisma } from "@/lib/prisma"
import { getCustomerBalance } from "@/lib/fiado/getCustomerBalance"

export async function getFiadoDashboardSummary() {
  const [entries, customers] = await Promise.all([
    prisma.financialEntry.findMany({
      where: { type: "RECEIVABLE", status: { not: "CANCELLED" } },
      include: { payments: true },
    }),
    prisma.creditCustomer.findMany(),
  ])

  const totalVendido = entries.reduce((sum, e) => sum + e.amount, 0)
  const totalRecebido = entries.reduce(
    (sum, e) => sum + e.payments.reduce((s, p) => s + p.amount, 0),
    0
  )
  const totalPendente = totalVendido - totalRecebido

  const balances = await Promise.all(
    customers.map(async (c) => ({
      customer: c,
      balance: (await getCustomerBalance(prisma, c.id)).balance,
    }))
  )

  const now = new Date()
  const overdueEntryCustomerIds = new Set(
    entries
      .filter((e) => e.status !== "PAID" && e.dueDate < now && e.creditCustomerId)
      .map((e) => e.creditCustomerId as string)
  )

  const inadimplentes = balances.filter(
    (b) => b.balance > 0 && overdueEntryCustomerIds.has(b.customer.id)
  ).length
  const emDia = balances.filter(
    (b) => b.balance <= b.customer.creditLimit && !overdueEntryCustomerIds.has(b.customer.id)
  ).length

  const withOpenBalance = balances.filter((b) => b.balance > 0)
  const maiorDevedor = [...balances].sort((a, b) => b.balance - a.balance)[0]
  const valorMedioEmAberto =
    withOpenBalance.length > 0
      ? Math.round(
          withOpenBalance.reduce((sum, b) => sum + b.balance, 0) / withOpenBalance.length
        )
      : 0

  return {
    totalVendido,
    totalRecebido,
    totalPendente,
    inadimplentes,
    emDia,
    maiorDevedor: maiorDevedor && maiorDevedor.balance > 0 ? maiorDevedor.customer.name : "-",
    quantidadeClientes: customers.length,
    valorMedioEmAberto,
  }
}
