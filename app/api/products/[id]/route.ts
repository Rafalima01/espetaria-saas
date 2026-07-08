import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { productBaseSchema } from "@/lib/validations/product"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return forbiddenResponse("Não autenticado")

  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER"])

    const { id } = await params
    const body = await req.json()
    const parsed = productBaseSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        code: data.code === "" ? null : data.code,
        barcode: data.barcode === "" ? null : data.barcode,
        description: data.description === "" ? null : data.description,
        supplier: data.supplier === "" ? null : data.supplier,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Código ou código de barras já cadastrado." },
        { status: 409 }
      )
    }
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
  }
}

// Products are never hard-deleted (sale/stock history references them) — this
// route just deactivates (soft delete).
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER"])

    const { id } = await params
    const product = await prisma.product.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao desativar produto" }, { status: 500 })
  }
}
