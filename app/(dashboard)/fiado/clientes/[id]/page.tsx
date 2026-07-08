import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCustomerBalance } from "@/lib/fiado/getCustomerBalance"
import { getCustomerAlerts } from "@/lib/fiado/getCustomerAlerts"
import { CustomerDetail } from "@/components/fiado/customer-detail"

export default async function ClienteFiadoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const customer = await prisma.creditCustomer.findUnique({ where: { id } })
  if (!customer) notFound()

  const [entries, balance, alerts] = await Promise.all([
    prisma.financialEntry.findMany({
      where: { creditCustomerId: id },
      include: { payments: true },
      orderBy: { createdAt: "desc" },
    }),
    getCustomerBalance(prisma, id),
    getCustomerAlerts(prisma, id),
  ])

  return (
    <CustomerDetail customer={customer} entries={entries} balance={balance} alerts={alerts} />
  )
}
