"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { GlassWater, Martini, Search, Wine } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { centsToBRL } from "@/lib/money"
import { calculateDoseEconomics } from "@/lib/bottles/doseCalculator"
import { cn } from "@/lib/utils"
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

const ALL = "__all__"
const RECIPES = "__recipes__"

const TILE =
  "group animate-rise-in flex flex-col gap-2 rounded-2xl bg-card p-4 text-left ring-1 ring-foreground/10 transition-[translate,scale,box-shadow,--tw-ring-color] duration-150 ease-(--ease-smooth-out) outline-none hover:-translate-y-0.5 active:scale-[0.98] hover:ring-primary/60 hover:shadow-[0_8px_30px_-12px_var(--primary)] focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-45"

function DoseOption({
  icon: Icon,
  title,
  price,
  hint,
  disabled,
  onClick,
}: {
  icon: typeof GlassWater
  title: string
  price: string
  hint?: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl bg-secondary p-3 text-left ring-1 ring-foreground/10 transition-all outline-none hover:ring-primary/60 focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-45"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium">{title}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </span>
      <span className="font-semibold text-primary tabular-nums">{price}</span>
    </button>
  )
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
  const [category, setCategory] = useState<string>(ALL)
  const [doseModalProduct, setDoseModalProduct] = useState<ProductWithDoses | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // "/" leva direto para a busca, de qualquer lugar da tela do PDV.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      if (target?.isContentEditable || document.querySelector("[role=dialog]")) return
      e.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [products]
  )

  const filteredProducts = useMemo(() => {
    if (category === RECIPES) return []
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (category !== ALL && p.category !== category) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q)
      )
    })
  }, [products, query, category])

  const filteredRecipes = useMemo(() => {
    if (category !== ALL && category !== RECIPES) return []
    const q = query.trim().toLowerCase()
    if (!q) return recipes
    return recipes.filter((r) => r.name.toLowerCase().includes(q))
  }, [recipes, query, category])

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

  // Enter na busca adiciona o item quando só um bate (ou o código/código de
  // barras é exato), no fluxo de leitor de código de barras. Esc limpa a busca.
  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (query) {
        e.preventDefault()
        setQuery("")
      }
      return
    }
    if (e.key !== "Enter") return
    const q = query.trim().toLowerCase()
    if (!q) return
    e.preventDefault()

    const exact = products.find(
      (p) => p.code?.toLowerCase() === q || p.barcode?.toLowerCase() === q
    )
    if (exact) {
      handleProductClick(exact)
    } else if (filteredProducts.length === 1 && filteredRecipes.length === 0) {
      handleProductClick(filteredProducts[0])
    } else if (filteredProducts.length === 0 && filteredRecipes.length === 1) {
      onAddRecipe(filteredRecipes[0])
    } else {
      return
    }
    setQuery("")
  }

  const chips: { id: string; label: string }[] = [
    { id: ALL, label: "Todos" },
    ...(recipes.length > 0 ? [{ id: RECIPES, label: "Receitas" }] : []),
    ...categories.map((c) => ({ id: c, label: c })),
  ]

  return (
    <div className="flex min-h-0 flex-col gap-4 lg:h-full lg:overflow-hidden">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          className="h-11 rounded-2xl bg-card pr-12 pl-11 text-sm"
          placeholder="Buscar por nome, categoria ou código"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          autoFocus
        />
        <kbd
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground sm:block"
        >
          /
        </kbd>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Categorias">
        {chips.map((chip) => {
          const active = category === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(chip.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      <div className="grid auto-rows-min grid-cols-2 content-start gap-3 sm:grid-cols-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto xl:grid-cols-4">
        {filteredProducts.map((product, index) => {
          const isFractional = product.productType === "FRACTIONAL"
          const outOfStock = !isFractional && product.stock <= 0
          const lowStock = !isFractional && !outOfStock && product.stock <= product.minStock
          return (
            <button
              key={`product:${product.id}`}
              type="button"
              disabled={outOfStock}
              className={TILE}
              style={{ "--i": index } as React.CSSProperties}
              onClick={() => handleProductClick(product)}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="line-clamp-2 text-sm leading-snug font-medium">{product.name}</span>
                {isFractional && (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <GlassWater className="size-4" />
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{product.category}</span>
              <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                {isFractional ? (
                  <span className="text-sm font-semibold text-primary">Por dose</span>
                ) : (
                  <span className="text-lg font-semibold text-primary tabular-nums">
                    {centsToBRL(product.salePrice)}
                  </span>
                )}
                {outOfStock ? (
                  <Badge variant="destructive">Sem estoque</Badge>
                ) : (
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      lowStock ? "text-warning" : "text-muted-foreground"
                    )}
                  >
                    {product.stock} {isFractional ? "seladas" : "un."}
                  </span>
                )}
              </div>
            </button>
          )
        })}
        {filteredRecipes.map((recipe, recipeIndex) => (
          <button
            key={`recipe:${recipe.id}`}
            type="button"
            className={TILE}
            style={{ "--i": filteredProducts.length + recipeIndex } as React.CSSProperties}
            onClick={() => onAddRecipe(recipe)}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="line-clamp-2 text-sm leading-snug font-medium">{recipe.name}</span>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Martini className="size-4" />
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {recipe.cupProduct ? recipe.cupProduct.name : "Receita"}
            </span>
            <div className="mt-auto flex items-end justify-between gap-2 pt-1">
              <span className="text-lg font-semibold text-primary tabular-nums">
                {centsToBRL(recipe.salePrice)}
              </span>
              <Badge variant="secondary">Receita</Badge>
            </div>
          </button>
        ))}
        {filteredProducts.length === 0 && filteredRecipes.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            Nada encontrado.
          </p>
        )}
      </div>

      <Dialog open={doseModalProduct !== null} onOpenChange={(open) => !open && setDoseModalProduct(null)}>
        <DialogContent className="sm:max-w-md">
          {doseModalProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{doseModalProduct.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">Como deseja vender?</p>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                {doseModalProduct.dosePrices.map((dp) => {
                  const econ = calculateDoseEconomics({
                    volumeMl: doseModalProduct.volumeMl!,
                    doseMl: dp.doseSize.volumeMl,
                    purchasePrice: doseModalProduct.purchasePrice,
                    salePrice: dp.salePrice,
                  })
                  return (
                    <DoseOption
                      key={dp.doseSizeId}
                      icon={GlassWater}
                      title={`Dose ${dp.doseSize.volumeMl}ml`}
                      hint={`Lucro ${centsToBRL(econ.profitPerDose)} por dose`}
                      price={centsToBRL(dp.salePrice)}
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
                    />
                  )
                })}
                {doseModalProduct.fullBottleSalePrice && (
                  <>
                    <DoseOption
                      icon={Wine}
                      title="Meia garrafa"
                      price={centsToBRL(Math.round(doseModalProduct.fullBottleSalePrice / 2))}
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
                    />
                    <DoseOption
                      icon={Wine}
                      title="Garrafa inteira"
                      hint={doseModalProduct.stock <= 0 ? "Sem estoque" : undefined}
                      price={centsToBRL(doseModalProduct.fullBottleSalePrice)}
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
                    />
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
