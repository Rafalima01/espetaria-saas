"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { brlToCents } from "@/lib/money"
import { cn } from "@/lib/utils"
import type { Product, Recipe, RecipeIngredient } from "@/lib/generated/prisma/client"

type IngredientRow = {
  productId: string
  volumeMl: string
}

const FIELD_INPUT = "h-10 rounded-xl bg-background"

function toRows(ingredients?: RecipeIngredient[]): IngredientRow[] {
  if (!ingredients || ingredients.length === 0) {
    return [{ productId: "", volumeMl: "" }]
  }
  return ingredients.map((i) => ({
    productId: i.productId,
    volumeMl: i.volumeMl ? String(i.volumeMl) : "",
  }))
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string
  htmlFor: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
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
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações</CardTitle>
            <CardDescription>Como a receita aparece no PDV</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" htmlFor="name" className="sm:col-span-2">
              <Input id="name" name="name" className={FIELD_INPUT} defaultValue={recipe?.name} required />
            </Field>
            <Field label="Copo servido" htmlFor="cupProductId">
              <Select
                name="cupProductId"
                defaultValue={recipe?.cupProductId ?? undefined}
                items={Object.fromEntries(products.map((p) => [p.id, p.name]))}
              >
                <SelectTrigger id="cupProductId" className="h-10 w-full rounded-xl">
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
            </Field>
            <Field label="Preço de venda (R$)" htmlFor="salePrice">
              <Input
                id="salePrice"
                name="salePrice"
                inputMode="decimal"
                className={FIELD_INPUT}
                defaultValue={recipe ? (recipe.salePrice / 100).toFixed(2).replace(".", ",") : ""}
                placeholder="0,00"
                required
              />
            </Field>
            <Field label="Descrição" htmlFor="description" className="sm:col-span-2">
              <Textarea
                id="description"
                name="description"
                className="min-h-24 rounded-xl bg-background"
                defaultValue={recipe?.description ?? ""}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ingredientes</CardTitle>
            <CardDescription>
              Bebidas por dose consomem o volume em ml. Itens simples (gelo, copo) consomem 1 unidade.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {rows.map((row, idx) => {
              const selected = productById.get(row.productId)
              const isFractional = selected?.productType === "FRACTIONAL"
              return (
                <div
                  key={idx}
                  className="flex flex-wrap items-end gap-3 rounded-2xl bg-secondary/60 p-3"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center self-center rounded-full bg-background text-xs font-semibold text-primary">
                    {idx + 1}
                  </span>
                  <div className="flex min-w-48 flex-1 flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">Produto</span>
                    <Select
                      value={row.productId}
                      onValueChange={(v) => updateRow(idx, { productId: v ?? "" })}
                      items={Object.fromEntries(products.map((p) => [p.id, p.name]))}
                    >
                      <SelectTrigger className="h-10 w-full rounded-xl bg-background">
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
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-muted-foreground">Volume (ml)</span>
                      <Input
                        type="number"
                        min={1}
                        value={row.volumeMl}
                        onChange={(e) => updateRow(idx, { volumeMl: e.target.value })}
                        className="h-10 w-28 rounded-xl bg-background"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    aria-label={`Remover ingrediente ${idx + 1}`}
                    onClick={() => setRows((r) => r.filter((_, i) => i !== idx))}
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors outline-none hover:bg-destructive/15 hover:text-destructive focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )
            })}
            <Button
              type="button"
              variant="outline"
              className="h-10 w-fit rounded-xl"
              onClick={() => setRows((r) => [...r, { productId: "", volumeMl: "" }])}
            >
              <Plus className="size-4" />
              Adicionar ingrediente
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-0">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="active" name="active" defaultChecked={recipe?.active ?? true} />
              <Label htmlFor="active">Receita ativa</Label>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                loading={submitting}
                className="h-11 rounded-xl text-base font-semibold"
              >
                {submitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar receita"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-xl"
                onClick={() => router.push("/receitas")}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
