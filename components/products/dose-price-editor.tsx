"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
          <CardTitle className="text-base">Preços por tamanho de dose</CardTitle>
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
        <CardTitle className="text-base">Preços por tamanho de dose</CardTitle>
        <CardDescription>Deixe em branco os tamanhos que você não quer oferecer</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {doseSizes.map((ds) => {
              const existing = priceByDoseSize.get(ds.id)
              return (
                <label
                  key={ds.id}
                  htmlFor={`price-${ds.id}`}
                  className="flex flex-col gap-2 rounded-2xl bg-secondary/60 p-3 ring-1 ring-foreground/10 transition-shadow focus-within:ring-primary/60"
                >
                  <span className="text-sm font-medium tabular-nums">{ds.volumeMl}ml</span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <input
                      id={`price-${ds.id}`}
                      name={`price-${ds.id}`}
                      inputMode="decimal"
                      placeholder="não oferecer"
                      className="w-full bg-transparent text-lg font-semibold text-primary tabular-nums outline-none placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground"
                      defaultValue={existing ? (existing / 100).toFixed(2).replace(".", ",") : ""}
                    />
                  </span>
                </label>
              )
            })}
          </div>
          <Button type="submit" loading={submitting} className="h-10 w-fit rounded-xl px-5">
            {submitting ? "Salvando..." : "Salvar preços"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
