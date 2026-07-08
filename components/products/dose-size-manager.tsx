"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DoseSize } from "@/lib/generated/prisma/client"

export function DoseSizeManager({ doseSizes }: { doseSizes: DoseSize[] }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    setSubmitting(true)
    try {
      const form = new FormData(formEl)
      const volumeMl = Number(form.get("volumeMl") ?? 0)
      const res = await fetch("/api/dose-sizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volumeMl, active: true }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao adicionar tamanho")
        return
      }
      toast.success("Tamanho de dose adicionado")
      formEl.reset()
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleActive(doseSize: DoseSize) {
    const res = await fetch(`/api/dose-sizes/${doseSize.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !doseSize.active }),
    })
    if (!res.ok) {
      toast.error("Erro ao atualizar")
      return
    }
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tamanhos de dose</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {doseSizes.map((ds) => (
            <Badge
              key={ds.id}
              variant={ds.active ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => toggleActive(ds)}
            >
              {ds.volumeMl}ml {!ds.active && "(inativo)"}
            </Badge>
          ))}
          {doseSizes.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum tamanho cadastrado.</p>
          )}
        </div>
        <form onSubmit={handleAdd} className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="volumeMl" className="text-xs text-muted-foreground">
              Novo tamanho (ml)
            </label>
            <Input id="volumeMl" name="volumeMl" type="number" min={1} className="w-32" required />
          </div>
          <Button type="submit" size="sm" disabled={submitting}>
            Adicionar
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
