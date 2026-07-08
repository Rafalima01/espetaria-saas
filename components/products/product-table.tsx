"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { centsToBRL } from "@/lib/money"
import { PRODUCT_TYPE_LABELS } from "@/lib/constants"
import type { Product } from "@/lib/generated/prisma/client"

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter()

  async function toggleActive(product: Product) {
    const res = await fetch(`/api/products/${product.id}`, {
      method: product.active ? "DELETE" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: product.active ? undefined : JSON.stringify({ active: true }),
    })
    if (!res.ok) {
      toast.error("Erro ao atualizar produto")
      return
    }
    toast.success(product.active ? "Produto desativado" : "Produto ativado")
    router.refresh()
  }

  if (products.length === 0) {
    return <p className="text-muted-foreground">Nenhum produto encontrado.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Preço venda</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const lowStock = product.stock <= product.minStock
            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.category}</TableCell>
                <TableCell className="text-muted-foreground">
                  {PRODUCT_TYPE_LABELS[product.productType] ?? product.productType}
                </TableCell>
                <TableCell>{centsToBRL(product.salePrice)}</TableCell>
                <TableCell>
                  <span className={lowStock ? "font-semibold text-destructive" : ""}>
                    {product.stock}
                  </span>
                  {lowStock && (
                    <Badge variant="destructive" className="ml-2">
                      Estoque baixo
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={product.active ? "default" : "secondary"}>
                    {product.active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2 text-right">
                  <Button
                    render={<Link href={`/produtos/${product.id}`} />}
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                  >
                    Editar
                  </Button>
                  <Button
                    variant={product.active ? "destructive" : "secondary"}
                    size="sm"
                    onClick={() => toggleActive(product)}
                  >
                    {product.active ? "Desativar" : "Ativar"}
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
