import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { productSchema } from "@/lib/validations/product"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return forbiddenResponse("Não autenticado")

  const search = req.nextUrl.searchParams.get("search") ?? undefined
  const category = req.nextUrl.searchParams.get("category") ?? undefined
  const onlyActive = req.nextUrl.searchParams.get("active")

  const products = await prisma.product.findMany({
    where: {
      ...(search
        ? { name: { contains: search } }
        : {}),
      ...(category ? { category } : {}),
      ...(onlyActive === "true" ? { active: true } : {}),
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER"])

    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const product = await prisma.product.create({
      data: {
        ...data,
        code: data.code || undefined,
        barcode: data.barcode || undefined,
        description: data.description || undefined,
        supplier: data.supplier || undefined,
      },
    })

    return NextResponse.json(product, { status: 201 })
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
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}
