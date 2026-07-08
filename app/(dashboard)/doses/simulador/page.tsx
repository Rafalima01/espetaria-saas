import { prisma } from "@/lib/prisma"
import { SimulatorForm } from "@/components/doses/simulator-form"

export default async function SimuladorPage() {
  const products = await prisma.product.findMany({
    where: { active: true, productType: "FRACTIONAL" },
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Simulador de Lucro</h1>
        <p className="text-muted-foreground">
          Calcule o rendimento de uma garrafa sem precisar cadastrar preços — nada aqui é salvo.
        </p>
      </div>
      <SimulatorForm products={products} />
    </div>
  )
}
