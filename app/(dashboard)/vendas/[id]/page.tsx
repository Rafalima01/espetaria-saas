import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { SaleDetail } from "@/components/sales/sale-detail"

export default async function VendaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [session, sale] = await Promise.all([
    auth(),
    prisma.sale.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { name: true } } } },
        doseSaleItems: { include: { product: { select: { name: true } } } },
        recipeSaleItems: { include: { recipe: { select: { name: true } } } },
        payments: true,
        user: { select: { name: true } },
      },
    }),
  ])
  if (!sale) notFound()

  const role = session?.user.role
  const canCancel = role === "ADMIN" || role === "MANAGER" || role === "CASHIER"

  return <SaleDetail sale={sale} canCancel={canCancel} />
}
