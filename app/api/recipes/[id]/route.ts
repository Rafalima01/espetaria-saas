import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { recipeSchema } from "@/lib/validations/recipe"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return forbiddenResponse("Não autenticado")

  const { id } = await params
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { ingredients: true },
  })
  if (!recipe) return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
  return NextResponse.json(recipe)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER"])

    const { id } = await params
    const body = await req.json()
    const parsed = recipeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const recipe = await prisma.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } })
      return tx.recipe.update({
        where: { id },
        data: {
          name: data.name,
          cupProductId: data.cupProductId || null,
          salePrice: data.salePrice,
          description: data.description || null,
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
    })

    return NextResponse.json(recipe)
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar receita" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER"])

    const { id } = await params
    const recipe = await prisma.recipe.update({ where: { id }, data: { active: false } })
    return NextResponse.json(recipe)
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao desativar receita" }, { status: 500 })
  }
}
