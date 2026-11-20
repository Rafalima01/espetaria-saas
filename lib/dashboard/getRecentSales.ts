import { prisma } from "@/lib/prisma"

export async function getRecentSales(limit = 6) {
  return prisma.sale.findMany({
    where: { status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      total: true,
      createdAt: true,
      user: { select: { name: true } },
      payments: { select: { method: true } },
    },
  })
}
