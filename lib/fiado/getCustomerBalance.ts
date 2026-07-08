import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export type CustomerBalance = {
  totalCharged: number // cents, sum of all non-cancelled entries
  totalPaid: number // cents
  balance: number // cents, amount still owed
}

/** Computes a credit customer's live balance from the ledger — never stored, always recomputed. */
export async function getCustomerBalance(
  db: Prisma.TransactionClient | typeof prisma,
  creditCustomerId: string
): Promise<CustomerBalance> {
  const entries = await db.financialEntry.findMany({
    where: { creditCustomerId, status: { not: "CANCELLED" } },
    include: { payments: true },
  })

  const totalCharged = entries.reduce((sum, e) => sum + e.amount, 0)
  const totalPaid = entries.reduce(
    (sum, e) => sum + e.payments.reduce((s, p) => s + p.amount, 0),
    0
  )

  return { totalCharged, totalPaid, balance: totalCharged - totalPaid }
}
