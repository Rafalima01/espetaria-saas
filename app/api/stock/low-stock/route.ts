import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { stock: "asc" },
  })
  const lowStock = products.filter((p) => p.stock <= p.minStock)

  return NextResponse.json(lowStock)
}
