"use client"

import { useMemo, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateDoseEconomics } from "@/lib/bottles/doseCalculator"
import { centsToBRL, brlToCents } from "@/lib/money"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/generated/prisma/client"

const QUICK_DOSES = [20, 30, 40, 50, 60, 100]

export function SimulatorForm({ products }: { products: Product[] }) {
  const [productId, setProductId] = useState<string>("")
  const [doseMlText, setDoseMlText] = useState("50")
  const [salePriceText, setSalePriceText] = useState("")

  const product = products.find((p) => p.id === productId)
  const doseMl = Number(doseMlText) || 0
  const salePrice = brlToCents(salePriceText)

  const result = useMemo(() => {
    if (!product || !product.volumeMl) return null
    return calculateDoseEconomics({
      volumeMl: product.volumeMl,
      doseMl,
      purchasePrice: product.purchasePrice,
      salePrice,
    })
  }, [product, doseMl, salePrice])

  const margin = result?.marginPercent ?? 0
  const negative = (result?.totalProfit ?? 0) < 0

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da simulação</CardTitle>
          <CardDescription>Escolha a garrafa, o tamanho da dose e o preço</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="product">Garrafa</Label>
            <Select
              value={productId}
              onValueChange={(v) => setProductId(v ?? "")}
              items={Object.fromEntries(products.map((p) => [p.id, `${p.name} (${p.volumeMl}ml)`]))}
            >
              <SelectTrigger id="product" className="h-10 w-full rounded-xl">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.volumeMl}ml)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="doseMl">Volume da dose (ml)</Label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_DOSES.map((ml) => (
                <button
                  key={ml}
                  type="button"
                  aria-pressed={doseMl === ml}
                  onClick={() => setDoseMlText(String(ml))}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-medium tabular-nums transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    doseMl === ml
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {ml}ml
                </button>
              ))}
            </div>
            <Input
              id="doseMl"
              type="number"
              min={1}
              className="h-10 rounded-xl bg-background"
              value={doseMlText}
              onChange={(e) => setDoseMlText(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="salePrice">Preço de venda por dose (R$)</Label>
            <Input
              id="salePrice"
              inputMode="decimal"
              placeholder="0,00"
              className="h-10 rounded-xl bg-background"
              value={salePriceText}
              onChange={(e) => setSalePriceText(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="surface-glow">
        <CardHeader>
          <CardTitle className="text-base">Resultado</CardTitle>
          <CardDescription>
            {product ? `${product.name} · ${product.volumeMl}ml` : "Aguardando uma garrafa"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {!product ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Selecione uma garrafa para simular.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-1 rounded-2xl bg-secondary/60 p-4">
                <span className="text-sm text-muted-foreground">Lucro total da garrafa</span>
                <span
                  className={cn(
                    "text-4xl font-semibold tracking-tight tabular-nums",
                    negative ? "text-destructive" : "text-primary"
                  )}
                >
                  {centsToBRL(result?.totalProfit ?? 0)}
                </span>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                    <div
                      className={cn("h-full rounded-full", negative ? "bg-destructive" : "bg-primary")}
                      style={{ width: `${Math.min(100, Math.max(0, margin))}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium tabular-nums">Margem {margin.toFixed(1)}%</span>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-3">
                <Metric label="Doses possíveis" value={String(result?.dosesPossible ?? 0)} />
                <Metric label="Custo por dose" value={centsToBRL(result?.costPerDose ?? 0)} />
                <Metric label="Lucro por dose" value={centsToBRL(result?.profitPerDose ?? 0)} />
                <Metric label="Faturamento total" value={centsToBRL(result?.totalRevenue ?? 0)} />
                <Metric label="Custo da garrafa" value={centsToBRL(result?.totalCost ?? 0)} />
              </dl>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-secondary/40 px-3 py-2.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
