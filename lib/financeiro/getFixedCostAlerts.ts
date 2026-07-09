import { prisma } from "@/lib/prisma"
import { FIXED_COST_DUE_SOON_DAYS } from "@/lib/constants"

export type FixedCostAlert = {
  id: string
  description: string
  amount: number
  dueDate: Date
  status: "OVERDUE" | "DUE_SOON"
}

/** Open/partially-paid fixed-cost entries overdue or due within the next N days, most urgent first. */
export async function getFixedCostAlerts(): Promise<FixedCostAlert[]> {
  const now = new Date()
  const dueSoonThreshold = new Date(now.getTime() + FIXED_COST_DUE_SOON_DAYS * 24 * 60 * 60 * 1000)

  const entries = await prisma.financialEntry.findMany({
    where: {
      type: "PAYABLE",
      status: { in: ["OPEN", "PARTIALLY_PAID"] },
      dueDate: { lte: dueSoonThreshold },
    },
    orderBy: { dueDate: "asc" },
  })

  return entries.map((e) => ({
    id: e.id,
    description: e.description,
    amount: e.amount,
    dueDate: e.dueDate,
    status: e.dueDate < now ? "OVERDUE" : "DUE_SOON",
  }))
}
