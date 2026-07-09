"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { centsToBRL } from "@/lib/money"
import { calculateDoseEconomics } from "@/lib/bottles/doseCalculator"
import type { DoseMode } from "@/lib/pdv/use-cart"
import type { Product } from "@/lib/generated/prisma/client"

type ProductWithDoses = Product & {
  dosePrices: { doseSizeId: string; salePrice: number; doseSize: { id: string; volumeMl: number } }[]
}

type RecipeWithCup = {
  id: string
  name: string
  salePrice: number
  cupProduct: { name: string } | null
}

type DosePayload = {
  productId: string
  productName: string
  doseSizeId?: string
  mode: DoseMode
  volumeMl: number
  unitPrice: number
  label: string
}

export function CatalogSearch({
  products,
  recipes,
  onAddProduct,
  onAddDose,
  onAddRecipe,
}: {
  products: ProductWithDoses[]
  recipes: RecipeWithCup[]
  onAddProduct: (product: Product) => void
  onAddDose: (dose: DosePayload) => void
  onAddRecipe: (recipe: { id: string; name: string; salePrice: number }) => void
}) {
  const [query, setQuery] = useState("")
  const [doseModalProduct, setDoseModalProduct] = useState<ProductWithDoses | null>(null)

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q)
    )
  }, [products, query])

  const filteredRecipes = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return recipes
    return recipes.filter((r) => r.name.toLowerCase().includes(q))
  }, [recipes, query])

  function handleProductClick(product: ProductWithDoses) {
    if (product.productType === "FRACTIONAL") {
      setDoseModalProduct(product)
    } else {
      onAddProduct(product)
    }
  }

  function addDoseAndClose(dose: DosePayload) {
    onAddDose(dose)
    setDoseModalProduct(null)
  }

  return (
    <div className="flex min-h-0 flex-col gap-3 lg:h-full lg:overflow-hidden">
      <Input
        placeholder="Buscar produto ou receita por nome, categoria ou código..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:overflow-y-auto xl:grid-cols-4">
        {filteredProducts.map((product) => {
          const isFractional = product.productType === "FRACTIONAL"
          const outOfStock = !isFractional && product.stock <= 0
          return (
            <Card
              key={`product:${product.id}`}
              className={`cursor-pointer transition-colors hover:border-primary ${
                outOfStock ? "opacity-50" : ""
              }`}
              onClick={() => !outOfStock && handleProductClick(product)}
            >
              <CardContent className="flex flex-col gap-1 p-3">
                <span className="text-sm font-medium">{product.name}</span>
                <span className="text-xs text-muted-foreground">{product.category}</span>
                <div className="mt-1 flex items-center justify-between">
                  {isFractional ? (
                    <Badge variant="secondary">🥃 Dose</Badge>
                  ) : (
                    <span className="text-sm font-semibold">{centsToBRL(product.salePrice)}</span>
                  )}
                  {isFractional ? (
                    <span className="text-xs text-muted-foreground">{product.stock} un. seladas</span>
                  ) : outOfStock ? (
                    <Badge variant="destructive">Sem estoque</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">{product.stock} un.</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filteredRecipes.map((recipe) => (
          <Card
            key={`recipe:${recipe.id}`}
            className="cursor-pointer transition-colors hover:border-primary"
            onClick={() => onAddRecipe(recipe)}
          >
            <CardContent className="flex flex-col gap-1 p-3">
              <span className="text-sm font-medium">{recipe.name}</span>
              <span className="text-xs text-muted-foreground">
                {recipe.cupProduct ? recipe.cupProduct.name : "Receita"}
              </span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-semibold">{centsToBRL(recipe.salePrice)}</span>
                <Badge variant="secondary">Receita</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredProducts.length === 0 && filteredRecipes.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">Nada encontrado.</p>
        )}
      </div>

      <Dialog open={doseModalProduct !== null} onOpenChange={(open) => !open && setDoseModalProduct(null)}>
        <DialogContent>
          {doseModalProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{doseModalProduct.name} — como deseja vender?</DialogTitle>
              </DialogHeader>
              <div className="flex flex-wrap gap-2">
                {doseModalProduct.dosePrices.map((dp) => {
                  const econ = calculateDoseEconomics({
                    volumeMl: doseModalProduct.volumeMl!,
                    doseMl: dp.doseSize.volumeMl,
                    purchasePrice: doseModalProduct.purchasePrice,
                    salePrice: dp.salePrice,
                  })
                  return (
                    <Button
                      key={dp.doseSizeId}
                      type="button"
                      variant="outline"
                      className="flex h-auto flex-col items-start gap-1 py-2"
                      onClick={() =>
                        addDoseAndClose({
                          productId: doseModalProduct.id,
                          productName: doseModalProduct.name,
                          doseSizeId: dp.doseSizeId,
                          mode: "DOSE",
                          volumeMl: dp.doseSize.volumeMl,
                          unitPrice: dp.salePrice,
                          label: `${dp.doseSize.volumeMl}ml`,
                        })
                      }
                    >
                      <span>
                        🥃 Dose {dp.doseSize.volumeMl}ml — {centsToBRL(dp.salePrice)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        lucro {centsToBRL(econ.profitPerDose)}/dose
                      </span>
                    </Button>
                  )
                })}
                {doseModalProduct.fullBottleSalePrice && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        addDoseAndClose({
                          productId: doseModalProduct.id,
                          productName: doseModalProduct.name,
                          mode: "HALF_BOTTLE",
                          volumeMl: Math.floor(doseModalProduct.volumeMl! / 2),
                          unitPrice: Math.round(doseModalProduct.fullBottleSalePrice! / 2),
                          label: "Meia garrafa",
                        })
                      }
                    >
                      Meia garrafa — {centsToBRL(Math.round(doseModalProduct.fullBottleSalePrice / 2))}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={doseModalProduct.stock <= 0}
                      onClick={() =>
                        addDoseAndClose({
                          productId: doseModalProduct.id,
                          productName: doseModalProduct.name,
                          mode: "FULL_BOTTLE",
                          volumeMl: doseModalProduct.volumeMl!,
                          unitPrice: doseModalProduct.fullBottleSalePrice!,
                          label: "Garrafa inteira",
                        })
                      }
                    >
                      🍾 Garrafa inteira — {centsToBRL(doseModalProduct.fullBottleSalePrice)}
                      {doseModalProduct.stock <= 0 && (
                        <Badge variant="destructive" className="ml-2">
                          Sem estoque
                        </Badge>
                      )}
                    </Button>
                  </>
                )}
                {doseModalProduct.dosePrices.length === 0 && !doseModalProduct.fullBottleSalePrice && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum preço configurado para este produto ainda.
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
