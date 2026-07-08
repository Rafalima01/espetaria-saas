import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { recipeSchema } from "@/lib/validations/recipe"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return forbiddenResponse("Não autenticado")

  const onlyActive = req.nextUrl.searchParams.get("active")
  const recipes = await prisma.recipe.findMany({
    where: onlyActive === "true" ? { active: true } : undefined,
    include: { ingredients: { include: { product: { select: { name: true } } } }, cupProduct: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(recipes)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER"])

    const body = await req.json()
    const parsed = recipeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const recipe = await prisma.recipe.create({
      data: {
        name: data.name,
        cupProductId: data.cupProductId || undefined,
        salePrice: data.salePrice,
        description: data.description || undefined,
        active: data.active,
        ingredients: {
          create: data.ingredients.map((i) => ({
            productId: i.productId,
            volumeMl: i.volumeMl,
          })),
        },
      },
      include: { ingredients: true },
    })

    return NextResponse.json(recipe, { status: 201 })
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar receita" }, { status: 500 })
  }
}
