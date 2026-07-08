import { prisma } from "@/lib/prisma"
import { getTodayRange, getLastNDaysRange } from "@/lib/dates"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"

export async function getSalesByHour() {
  const { start, end } = getTodayRange()
  const rows = await prisma.$queryRaw<{ hour: string; total: number }[]>`
    SELECT strftime('%H', createdAt, '-3 hours') as hour, SUM(total) as total
    FROM Sale
    WHERE status = 'COMPLETED' AND createdAt >= ${start.toISOString()} AND createdAt < ${end.toISOString()}
    GROUP BY hour
    ORDER BY hour
  `
  const byHour = new Map(rows.map((r) => [Number(r.hour), Number(r.total)]))
  return Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour.toString().padStart(2, "0")}h`,
    total: (byHour.get(hour) ?? 0) / 100,
  }))
}

export async function getSalesByDay(days = 14) {
  const { start, end } = getLastNDaysRange(days)
  const rows = await prisma.$queryRaw<{ day: string; total: number }[]>`
    SELECT strftime('%Y-%m-%d', createdAt, '-3 hours') as day, SUM(total) as total
    FROM Sale
    WHERE status = 'COMPLETED' AND createdAt >= ${start.toISOString()} AND createdAt < ${end.toISOString()}
    GROUP BY day
    ORDER BY day
  `
  const byDay = new Map(rows.map((r) => [r.day, Number(r.total)]))
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000)
    const key = date.toISOString().slice(0, 10)
    return {
      day: key.slice(5),
      total: (byDay.get(key) ?? 0) / 100,
    }
  })
}

export async function getTopProducts(limit = 5) {
  const { start, end } = getLastNDaysRange(30)
  const grouped = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: { sale: { status: "COMPLETED", createdAt: { gte: start, lt: end } } },
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  })
  const products = await prisma.product.findMany({
    where: { id: { in: grouped.map((g) => g.productId) } },
    select: { id: true, name: true },
  })
  const nameById = new Map(products.map((p) => [p.id, p.name]))
  return grouped.map((g) => ({
    name: nameById.get(g.productId) ?? "?",
    quantity: g._sum.quantity ?? 0,
    total: (g._sum.total ?? 0) / 100,
  }))
}

export async function getPaymentMethodBreakdown() {
  const { start, end } = getTodayRange()
  const grouped = await prisma.payment.groupBy({
    by: ["method"],
    where: { sale: { status: "COMPLETED", createdAt: { gte: start, lt: end } } },
    _sum: { amount: true },
  })
  return grouped.map((g) => ({
    method: PAYMENT_METHOD_LABELS[g.method] ?? g.method,
    total: (g._sum.amount ?? 0) / 100,
  }))
}
