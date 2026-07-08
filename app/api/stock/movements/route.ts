import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { stockMovementSchema } from "@/lib/validations/stock-movement"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return forbiddenResponse("Não autenticado")

  const productId = req.nextUrl.searchParams.get("productId") ?? undefined
  const movements = await prisma.stockMovement.findMany({
    where: productId ? { productId } : undefined,
    include: { product: { select: { name: true } }, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return NextResponse.json(movements)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const authed = requireRole(session, ["ADMIN", "MANAGER"])

    const body = await req.json()
    const parsed = stockMovementSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const { productId, type, quantity, reason } = parsed.data

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } })
      if (!product) throw new Error("PRODUCT_NOT_FOUND")

      let newStock: number
      let movementQuantity: number

      if (type === "ADJUSTMENT") {
        newStock = quantity
        movementQuantity = Math.abs(newStock - product.stock)
      } else {
        if (quantity < 1) throw new Error("INVALID_QUANTITY")
        const delta = type === "IN" ? quantity : -quantity
        newStock = product.stock + delta
        movementQuantity = quantity
        if (newStock < 0) throw new Error("INSUFFICIENT_STOCK")
      }

      const updated = await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      })

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity: movementQuantity,
          reason: reason || undefined,
          userId: authed.user!.id,
        },
      })

      return { product: updated, movement }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        { error: "Estoque insuficiente para essa saída." },
        { status: 409 }
      )
    }
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })
    }
    console.error(error)
    return NextResponse.json({ error: "Erro ao registrar movimentação" }, { status: 500 })
  }
}
