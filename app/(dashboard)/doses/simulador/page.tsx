import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/layout/page-header"
import { SimulatorForm } from "@/components/doses/simulator-form"

export default async function SimuladorPage() {
  const products = await prisma.product.findMany({
    where: { active: true, productType: "FRACTIONAL" },
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Simulador de lucro"
        description="Calcule o rendimento de uma garrafa sem cadastrar preços. Nada aqui é salvo."
        backHref="/doses"
      />
      <SimulatorForm products={products} />
    </div>
  )
}
