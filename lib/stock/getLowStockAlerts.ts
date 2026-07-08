import { prisma } from "@/lib/prisma"
import { getStockStatus } from "@/lib/stock/getStockStatus"

export type LowStockAlert = {
  id: string
  name: string
  stock: number
  minStock: number
  status: "LOW" | "CRITICAL"
}

/** Active products currently at LOW or CRITICAL stock status, most urgent first. */
export async function getLowStockAlerts(): Promise<LowStockAlert[]> {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { stock: "asc" },
  })

  return products
    .map((p) => ({ ...p, status: getStockStatus(p.stock, p.minStock) }))
    .filter((p): p is typeof p & { status: "LOW" | "CRITICAL" } => p.status !== "NORMAL")
    .sort((a, b) => (a.status === b.status ? 0 : a.status === "CRITICAL" ? -1 : 1))
}
