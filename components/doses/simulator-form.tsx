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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateDoseEconomics } from "@/lib/bottles/doseCalculator"
import { centsToBRL, brlToCents } from "@/lib/money"
import type { Product } from "@/lib/generated/prisma/client"

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

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Dados da simulação</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="product">Garrafa</Label>
            <Select
              value={productId}
              onValueChange={(v) => setProductId(v ?? "")}
              items={Object.fromEntries(products.map((p) => [p.id, `${p.name} (${p.volumeMl}ml)`]))}
            >
              <SelectTrigger id="product" className="w-full">
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
            <Input
              id="doseMl"
              type="number"
              min={1}
              value={doseMlText}
              onChange={(e) => setDoseMlText(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="salePrice">Preço de venda por dose (R$)</Label>
            <Input
              id="salePrice"
              placeholder="0,00"
              value={salePriceText}
              onChange={(e) => setSalePriceText(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {!product ? (
            <p className="text-muted-foreground">Selecione uma garrafa para simular.</p>
          ) : (
            <>
              <Row label="Doses possíveis" value={String(result?.dosesPossible ?? 0)} />
              <Row label="Custo por dose" value={centsToBRL(result?.costPerDose ?? 0)} />
              <Row label="Lucro por dose" value={centsToBRL(result?.profitPerDose ?? 0)} />
              <Row label="Faturamento total" value={centsToBRL(result?.totalRevenue ?? 0)} />
              <Row label="Custo da garrafa" value={centsToBRL(result?.totalCost ?? 0)} />
              <Row
                label="Lucro total da garrafa"
                value={centsToBRL(result?.totalProfit ?? 0)}
                emphasis
              />
              <Row
                label="Margem"
                value={`${(result?.marginPercent ?? 0).toFixed(1)}%`}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={emphasis ? "font-semibold" : ""}>{value}</span>
    </div>
  )
}
