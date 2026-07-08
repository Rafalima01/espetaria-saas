import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { getCustomerBalance } from "@/lib/fiado/getCustomerBalance"

export type CustomerAlerts = {
  overLimit: boolean
  hasOverdue: boolean
  openPurchaseCount: number
  manyOpenPurchases: boolean
}

const MANY_OPEN_PURCHASES_THRESHOLD = 5

export async function getCustomerAlerts(
  db: Prisma.TransactionClient | typeof prisma,
  creditCustomerId: string
): Promise<CustomerAlerts> {
  const [customer, balance, openEntries] = await Promise.all([
    db.creditCustomer.findUniqueOrThrow({ where: { id: creditCustomerId } }),
    getCustomerBalance(db, creditCustomerId),
    db.financialEntry.findMany({
      where: { creditCustomerId, status: { in: ["OPEN", "PARTIALLY_PAID"] } },
    }),
  ])

  const now = new Date()
  const hasOverdue = openEntries.some((e) => e.dueDate < now)

  return {
    overLimit: balance.balance > customer.creditLimit,
    hasOverdue,
    openPurchaseCount: openEntries.length,
    manyOpenPurchases: openEntries.length >= MANY_OPEN_PURCHASES_THRESHOLD,
  }
}
