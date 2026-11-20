"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileSpreadsheet, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ReportsFilter() {
  const router = useRouter()
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const query = new URLSearchParams()
  if (from) query.set("from", from)
  if (to) query.set("to", to)

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base">Período</CardTitle>
        <CardDescription>Deixe em branco para incluir todo o histórico</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="from">De</Label>
            <Input
              id="from"
              type="date"
              className="h-10 rounded-xl bg-background"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="to">Até</Label>
            <Input
              id="to"
              type="date"
              className="h-10 rounded-xl bg-background"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="h-10 rounded-xl px-4"
            onClick={() => {
              const a = document.createElement("a")
              a.href = `/api/fiado/relatorios/export?${query.toString()}`
              a.click()
            }}
          >
            <FileSpreadsheet className="size-4" />
            Exportar Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl px-4"
            onClick={() => router.push(`/fiado/relatorios/imprimir?${query.toString()}`)}
          >
            <Printer className="size-4" />
            Exportar PDF / Imprimir
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
