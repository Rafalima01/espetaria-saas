import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { restockSchema } from "@/lib/validations/stock-movement"
import { getStockStatus } from "@/lib/stock/getStockStatus"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"
import { parseSaoPauloDateInput } from "@/lib/dates"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const authed = requireRole(session, ["ADMIN", "MANAGER"])

    const body = await req.json()
    const parsed = restockSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const { productId, quantity, date, note } = parsed.data
    const createdAt = date ? parseSaoPauloDateInput(date) : new Date()

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } })
      if (!product) throw new Error("PRODUCT_NOT_FOUND")

      const updated = await tx.product.update({
        where: { id: productId },
        data: { stock: { increment: quantity } },
      })

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type: "IN",
          quantity,
          reason: note || "Reabastecimento",
          userId: authed.user!.id,
          createdAt,
        },
      })

      return { product: updated, movement }
    })

    return NextResponse.json({
      ...result,
      status: getStockStatus(result.product.stock, result.product.minStock),
    })
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })
    }
    console.error(error)
    return NextResponse.json({ error: "Erro ao registrar reabastecimento" }, { status: 500 })
  }
}
