import { prisma } from "@/lib/prisma"
import { getTodayRange, getMonthRange } from "@/lib/dates"
import { ensureFixedCostEntries } from "@/lib/financeiro/ensureFixedCostEntries"

async function salesAggregate(start: Date, end: Date) {
  return prisma.sale.aggregate({
    where: { status: "COMPLETED", createdAt: { gte: start, lt: end } },
    _sum: { total: true },
    _count: true,
    _avg: { total: true },
  })
}

async function profitForRange(start: Date, end: Date) {
  const items = await prisma.saleItem.findMany({
    where: {
      sale: { status: "COMPLETED", createdAt: { gte: start, lt: end } },
    },
    select: { unitPrice: true, costPriceSnapshot: true, quantity: true, discount: true },
  })
  return items.reduce(
    (sum, i) => sum + (i.unitPrice - i.costPriceSnapshot) * i.quantity - i.discount,
    0
  )
}

async function fixedCostsForMonth(start: Date, end: Date) {
  const entries = await prisma.financialEntry.findMany({
    where: { type: "PAYABLE", competencia: { not: null }, dueDate: { gte: start, lt: end } },
    include: { payments: true },
  })

  const total = entries.reduce((sum, e) => sum + e.amount, 0)
  const paid = entries.reduce(
    (sum, e) => (e.status === "PAID" ? sum + e.amount : sum),
    0
  )
  return { total, paid, pending: total - paid }
}

export async function getDashboardSummary() {
  await ensureFixedCostEntries()

  const today = getTodayRange()
  const month = getMonthRange()

  const [
    todayAgg,
    monthAgg,
    todayProfit,
    monthProfit,
    cashToday,
    cashFiadoToday,
    distinctCustomersToday,
    fixedCosts,
  ] = await Promise.all([
    salesAggregate(today.start, today.end),
    salesAggregate(month.start, month.end),
    profitForRange(today.start, today.end),
    profitForRange(month.start, month.end),
    prisma.payment.aggregate({
      where: {
        method: "CASH",
        sale: { status: "COMPLETED", createdAt: { gte: today.start, lt: today.end } },
      },
      _sum: { amount: true },
    }),
    // Fiado receipts collected in cash also count toward the till, even though
    // they're recorded as FinancialPayment rows, not Sale Payment rows.
    prisma.financialPayment.aggregate({
      where: { method: "CASH", createdAt: { gte: today.start, lt: today.end } },
      _sum: { amount: true },
    }),
    prisma.sale.count({
      where: { status: "COMPLETED", createdAt: { gte: today.start, lt: today.end } },
    }),
    fixedCostsForMonth(month.start, month.end),
  ])

  return {
    revenueToday: todayAgg._sum.total ?? 0,
    revenueMonth: monthAgg._sum.total ?? 0,
    salesCountToday: todayAgg._count,
    averageTicketToday: Math.round(todayAgg._avg.total ?? 0),
    profitToday: todayProfit,
    profitMonth: monthProfit,
    cashInDrawerToday: (cashToday._sum.amount ?? 0) + (cashFiadoToday._sum.amount ?? 0),
    customersServedToday: distinctCustomersToday,
    fixedCostsMonth: fixedCosts.total,
    fixedCostsPaidMonth: fixedCosts.paid,
    fixedCostsPendingMonth: fixedCosts.pending,
    netProfitMonth: monthProfit - fixedCosts.total,
  }
}
