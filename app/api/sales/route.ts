import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createSaleSchema } from "@/lib/validations/sale"
import { completeSale, InsufficientStockError, CustomerBlockedError } from "@/lib/sales/completeSale"
import { InsufficientBottleStockError, InvalidVolumeError } from "@/lib/bottles/consumeVolume"
import {
  BottleNotFoundError,
  ProductNotFractionalError,
  DosePriceNotConfiguredError,
  FullBottlePriceNotConfiguredError,
} from "@/lib/bottles/computeDoseSaleItem"
import { RecipeNotFoundError } from "@/lib/recipes/computeRecipeSaleItem"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return forbiddenResponse("Não autenticado")

  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 100)
  const sales = await prisma.sale.findMany({
    include: {
      items: { include: { product: { select: { name: true } } } },
      doseSaleItems: { include: { product: { select: { name: true } } } },
      recipeSaleItems: { include: { recipe: { select: { name: true } } } },
      payments: true,
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return NextResponse.json(sales)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const authed = requireRole(session, ["ADMIN", "MANAGER", "CASHIER", "WAITER"])

    const body = await req.json()
    const parsed = createSaleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const sale = await completeSale(parsed.data, authed.user!.id)
    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    if (
      error instanceof InsufficientStockError ||
      error instanceof InsufficientBottleStockError
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    if (error instanceof CustomerBlockedError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (
      error instanceof BottleNotFoundError ||
      error instanceof ProductNotFractionalError ||
      error instanceof DosePriceNotConfiguredError ||
      error instanceof FullBottlePriceNotConfiguredError ||
      error instanceof RecipeNotFoundError ||
      error instanceof InvalidVolumeError
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof Error && error.message === "PAYMENTS_MISMATCH") {
      return NextResponse.json(
        { error: "A soma dos pagamentos não corresponde ao total da venda." },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.message === "CUSTOMER_NOT_FOUND") {
      return NextResponse.json({ error: "Cliente fiado não encontrado" }, { status: 404 })
    }
    console.error(error)
    return NextResponse.json({ error: "Erro ao finalizar venda" }, { status: 500 })
  }
}
