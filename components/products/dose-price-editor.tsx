"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { brlToCents } from "@/lib/money"
import type { DoseSize } from "@/lib/generated/prisma/client"

type ExistingPrice = { doseSizeId: string; salePrice: number }

export function DosePriceEditor({
  productId,
  doseSizes,
  existingPrices,
}: {
  productId: string
  doseSizes: DoseSize[]
  existingPrices: ExistingPrice[]
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const priceByDoseSize = new Map(existingPrices.map((p) => [p.doseSizeId, p.salePrice]))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const form = new FormData(e.currentTarget)
      const prices = doseSizes
        .map((ds) => {
          const text = String(form.get(`price-${ds.id}`) ?? "")
          if (!text.trim()) return null
          return { doseSizeId: ds.id, salePrice: brlToCents(text) }
        })
        .filter((p): p is { doseSizeId: string; salePrice: number } => p !== null)

      const res = await fetch(`/api/products/${productId}/dose-prices`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? "Erro ao salvar preços")
        return
      }
      toast.success("Preços por dose salvos")
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  if (doseSizes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preços por tamanho de dose</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Nenhum tamanho de dose cadastrado ainda.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preços por tamanho de dose</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {doseSizes.map((ds) => {
              const existing = priceByDoseSize.get(ds.id)
              return (
                <div key={ds.id} className="flex flex-col gap-2">
                  <Label htmlFor={`price-${ds.id}`}>{ds.volumeMl}ml</Label>
                  <Input
                    id={`price-${ds.id}`}
                    name={`price-${ds.id}`}
                    inputMode="decimal"
                    placeholder="0,00 (deixe vazio p/ não oferecer)"
                    defaultValue={existing ? (existing / 100).toFixed(2).replace(".", ",") : ""}
                  />
                </div>
              )
            })}
          </div>
          <Button type="submit" disabled={submitting} className="w-fit">
            {submitting ? "Salvando..." : "Salvar preços"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
