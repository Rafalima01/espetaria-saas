import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { cancelSale } from "@/lib/sales/cancelSale"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    const authed = requireRole(session, ["ADMIN", "MANAGER", "CASHIER"])

    const { id } = await params
    const sale = await cancelSale(id, authed.user!.id)
    return NextResponse.json(sale)
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    if (error instanceof Error && error.message === "SALE_NOT_FOUND") {
      return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })
    }
    if (error instanceof Error && error.message === "ALREADY_CANCELLED") {
      return NextResponse.json({ error: "Venda já cancelada" }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: "Erro ao cancelar venda" }, { status: 500 })
  }
}
