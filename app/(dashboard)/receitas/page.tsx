import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { centsToBRL } from "@/lib/money"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function ReceitasPage() {
  const recipes = await prisma.recipe.findMany({
    include: { ingredients: true, cupProduct: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Receitas</h1>
          <p className="text-muted-foreground">{recipes.length} receita(s) cadastrada(s)</p>
        </div>
        <Button render={<Link href="/receitas/novo" />} nativeButton={false}>
          Nova receita
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Copo</TableHead>
              <TableHead>Ingredientes</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipes.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell className="font-medium">{recipe.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {recipe.cupProduct?.name ?? "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {recipe.ingredients.length}
                </TableCell>
                <TableCell>{centsToBRL(recipe.salePrice)}</TableCell>
                <TableCell>
                  <Badge variant={recipe.active ? "default" : "secondary"}>
                    {recipe.active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    render={<Link href={`/receitas/${recipe.id}`} />}
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {recipes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  Nenhuma receita cadastrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
