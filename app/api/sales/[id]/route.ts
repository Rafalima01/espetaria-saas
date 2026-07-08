import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { forbiddenResponse } from "@/lib/auth-guards"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return forbiddenResponse("Não autenticado")

  const { id } = await params
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { name: true } } } },
      doseSaleItems: { include: { product: { select: { name: true } } } },
      recipeSaleItems: { include: { recipe: { select: { name: true } } } },
      payments: true,
      user: { select: { name: true } },
    },
  })
  if (!sale) return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
  return NextResponse.json(sale)
}
