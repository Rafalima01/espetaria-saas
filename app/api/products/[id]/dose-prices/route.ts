import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { dosePricesSchema } from "@/lib/validations/dose"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

type Params = { params: Promise<{ id: string }> }

// Replaces the full set of dose-size prices configured for a product. Safe to
// hard-delete/recreate: DoseSaleItem already snapshots unitPrice at sale time,
// so BottleDosePrice rows carry no historical significance once superseded.
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER"])

    const { id: productId } = await params
    const body = await req.json()
    const parsed = dosePricesSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.bottleDosePrice.deleteMany({ where: { productId } }),
      prisma.bottleDosePrice.createMany({
        data: parsed.data.prices.map((p) => ({
          productId,
          doseSizeId: p.doseSizeId,
          salePrice: p.salePrice,
        })),
      }),
    ])

    const dosePrices = await prisma.bottleDosePrice.findMany({
      where: { productId },
      include: { doseSize: true },
    })
    return NextResponse.json(dosePrices)
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao salvar preços" }, { status: 500 })
  }
}
