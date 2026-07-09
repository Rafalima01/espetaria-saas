import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { fixedCostBaseSchema } from "@/lib/validations/fixed-cost"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return forbiddenResponse("Não autenticado")

  const onlyActive = req.nextUrl.searchParams.get("active")

  const fixedCosts = await prisma.fixedCost.findMany({
    where: onlyActive === "true" ? { active: true } : {},
    orderBy: { name: "asc" },
  })

  return NextResponse.json(fixedCosts)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER"])

    const body = await req.json()
    const parsed = fixedCostBaseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const fixedCost = await prisma.fixedCost.create({
      data: { ...data, notes: data.notes || undefined },
    })

    return NextResponse.json(fixedCost, { status: 201 })
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar custo fixo" }, { status: 500 })
  }
}
