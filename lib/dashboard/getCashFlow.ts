import { prisma } from "@/lib/prisma"
import { getMonthRange } from "@/lib/dates"

export type CashFlowEntry = {
  id: string
  date: Date
  description: string
  amount: number
  direction: "IN" | "OUT"
}

/** Cash flow for the current month, recomputed from Sale/Payment/FinancialPayment — never stored. */
export async function getCashFlow() {
  const { start, end } = getMonthRange()

  const [sales, fiadoReceipts, fixedCostPayments] = await Promise.all([
    prisma.sale.findMany({
      where: { status: "COMPLETED", createdAt: { gte: start, lt: end } },
      select: { id: true, total: true, createdAt: true },
    }),
    prisma.financialPayment.findMany({
      where: { createdAt: { gte: start, lt: end }, financialEntry: { type: "RECEIVABLE" } },
      include: { financialEntry: { select: { description: true } } },
    }),
    prisma.financialPayment.findMany({
      where: { createdAt: { gte: start, lt: end }, financialEntry: { type: "PAYABLE" } },
      include: { financialEntry: { select: { description: true } } },
    }),
  ])

  const entriesIn: CashFlowEntry[] = [
    ...sales.map((s) => ({
      id: s.id,
      date: s.createdAt,
      description: `Venda #${s.id.slice(-6).toUpperCase()}`,
      amount: s.total,
      direction: "IN" as const,
    })),
    ...fiadoReceipts.map((p) => ({
      id: p.id,
      date: p.createdAt,
      description: `Recebimento fiado — ${p.financialEntry.description}`,
      amount: p.amount,
      direction: "IN" as const,
    })),
  ]

  const entriesOut: CashFlowEntry[] = fixedCostPayments.map((p) => ({
    id: p.id,
    date: p.createdAt,
    description: `Pagamento — ${p.financialEntry.description}`,
    amount: p.amount,
    direction: "OUT" as const,
  }))

  const totalIn = entriesIn.reduce((sum, e) => sum + e.amount, 0)
  const totalOut = entriesOut.reduce((sum, e) => sum + e.amount, 0)

  const entries = [...entriesIn, ...entriesOut].sort((a, b) => b.date.getTime() - a.date.getTime())

  return { totalIn, totalOut, balance: totalIn - totalOut, entries }
}
