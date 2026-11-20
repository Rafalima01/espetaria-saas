import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { denyUnlessRole } from "@/lib/auth-guards"

export async function GET() {
  const session = await auth()
  const denied = denyUnlessRole(session, ["ADMIN", "MANAGER"])
  if (denied) return denied

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { stock: "asc" },
  })
  const lowStock = products.filter((p) => p.stock <= p.minStock)

  return NextResponse.json(lowStock)
}
