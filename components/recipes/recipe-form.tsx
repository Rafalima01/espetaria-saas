"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { brlToCents } from "@/lib/money"
import type { Product, Recipe, RecipeIngredient } from "@/lib/generated/prisma/client"

type IngredientRow = {
  productId: string
  volumeMl: string
}

function toRows(ingredients?: RecipeIngredient[]): IngredientRow[] {
  if (!ingredients || ingredients.length === 0) {
    return [{ productId: "", volumeMl: "" }]
  }
  return ingredients.map((i) => ({
    productId: i.productId,
    volumeMl: i.volumeMl ? String(i.volumeMl) : "",
  }))
}

export function RecipeForm({
  recipe,
  products,
}: {
  recipe?: Recipe & { ingredients: RecipeIngredient[] }
  products: Product[]
}) {
  const router = useRouter()
  const isEdit = !!recipe
  const [submitting, setSubmitting] = useState(false)
  const [rows, setRows] = useState<IngredientRow[]>(toRows(recipe?.ingredients))
  const productById = new Map(products.map((p) => [p.id, p]))

  function updateRow(idx: number, patch: Partial<IngredientRow>) {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const form = new FormData(e.currentTarget)
      const ingredients = rows
        .filter((r) => r.productId)
        .map((r) => ({
          productId: r.productId,
          volumeMl: r.volumeMl ? Number(r.volumeMl) : undefined,
        }))

      const payload = {
        name: String(form.get("name") ?? ""),
        cupProductId: String(form.get("cupProductId") ?? "") || undefined,
        salePrice: brlToCents(String(form.get("salePrice") ?? "0")),
        description: String(form.get("description") ?? ""),
        active: form.get("active") === "on",
        ingredients,
      }

      const url = isEdit ? `/api/recipes/${recipe.id}` : "/api/recipes"
      const method = isEdit ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error?.formErrors?.[0] ?? data.error ?? "Erro ao salvar receita")
        return
      }
      toast.success(isEdit ? "Receita atualizada" : "Receita criada")
      router.push("/receitas")
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" defaultValue={recipe?.name} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cupProductId">Copo servido</Label>
              <Select
                name="cupProductId"
                defaultValue={recipe?.cupProductId ?? undefined}
                items={Object.fromEntries(products.map((p) => [p.id, p.name]))}
              >
                <SelectTrigger id="cupProductId" className="w-full">
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="salePrice">Preço de venda (R$)</Label>
              <Input
                id="salePrice"
                name="salePrice"
                inputMode="decimal"
                defaultValue={
                  recipe ? (recipe.salePrice / 100).toFixed(2).replace(".", ",") : ""
                }
                placeholder="0,00"
                required
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" name="description" defaultValue={recipe?.description ?? ""} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label>Ingredientes</Label>
            {rows.map((row, idx) => {
              const selected = productById.get(row.productId)
              const isFractional = selected?.productType === "FRACTIONAL"
              return (
                <div key={idx} className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Produto</span>
                    <Select
                      value={row.productId}
                      onValueChange={(v) => updateRow(idx, { productId: v ?? "" })}
                      items={Object.fromEntries(products.map((p) => [p.id, p.name]))}
                    >
                      <SelectTrigger className="w-52">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isFractional && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Volume (ml)</span>
                      <Input
                        type="number"
                        min={1}
                        value={row.volumeMl}
                        onChange={(e) => updateRow(idx, { volumeMl: e.target.value })}
                        className="w-24"
                      />
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRows((r) => r.filter((_, i) => i !== idx))}
                  >
                    Remover
                  </Button>
                </div>
              )
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => setRows((r) => [...r, { productId: "", volumeMl: "" }])}
            >
              Adicionar ingrediente
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="active" name="active" defaultChecked={recipe?.active ?? true} />
            <Label htmlFor="active">Receita ativa</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar receita"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/receitas")}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
