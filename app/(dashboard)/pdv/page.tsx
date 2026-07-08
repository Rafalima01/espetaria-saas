import { prisma } from "@/lib/prisma"
import { PdvClient } from "@/components/pdv/pdv-client"

export default async function PdvPage() {
  const [products, recipes] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: { dosePrices: { include: { doseSize: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.recipe.findMany({
      where: { active: true },
      include: { cupProduct: true },
      orderBy: { name: "asc" },
    }),
  ])

  return <PdvClient products={products} recipes={recipes} />
}
