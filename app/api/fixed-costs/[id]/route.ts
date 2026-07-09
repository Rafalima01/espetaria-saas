import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { fixedCostBaseSchema } from "@/lib/validations/fixed-cost"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return forbiddenResponse("Não autenticado")

  const { id } = await params
  const fixedCost = await prisma.fixedCost.findUnique({ where: { id } })
  if (!fixedCost) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(fixedCost)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER"])

    const { id } = await params
    const body = await req.json()
    const parsed = fixedCostBaseSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const fixedCost = await prisma.fixedCost.update({
      where: { id },
      data: { ...data, notes: data.notes === "" ? null : data.notes },
    })

    return NextResponse.json(fixedCost)
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar custo fixo" }, { status: 500 })
  }
}

// Fixed costs are never hard-deleted (FinancialEntry references them) — this
// route just deactivates it, stopping future competência generation.
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER"])

    const { id } = await params
    const fixedCost = await prisma.fixedCost.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json(fixedCost)
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao desativar custo fixo" }, { status: 500 })
  }
}
