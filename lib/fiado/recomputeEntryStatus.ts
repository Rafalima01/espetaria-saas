import type { Prisma } from "@/lib/generated/prisma/client"

/** Recomputes a FinancialEntry's status from the sum of its payments — never tracked incrementally. */
export async function recomputeEntryStatus(tx: Prisma.TransactionClient, entryId: string) {
  const entry = await tx.financialEntry.findUniqueOrThrow({
    where: { id: entryId },
    include: { payments: true },
  })
  if (entry.status === "CANCELLED") return entry

  const paidSum = entry.payments.reduce((sum, p) => sum + p.amount, 0)
  const status = paidSum >= entry.amount ? "PAID" : paidSum > 0 ? "PARTIALLY_PAID" : "OPEN"

  return tx.financialEntry.update({ where: { id: entryId }, data: { status } })
}
