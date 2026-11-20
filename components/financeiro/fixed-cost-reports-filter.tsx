"use client"

import { useState } from "react"
import { FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export function FixedCostReportsFilter() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const query = new URLSearchParams()
  if (from) query.set("from", from)
  if (to) query.set("to", to)

  return (
    <Card>
      <CardContent className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="from">De (vencimento)</Label>
          <Input
            id="from"
            type="date"
            className="h-10 rounded-xl bg-background"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="to">Até (vencimento)</Label>
          <Input
            id="to"
            type="date"
            className="h-10 rounded-xl bg-background"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <Button
          type="button"
          className="h-10 rounded-xl px-4"
          onClick={() => {
            const a = document.createElement("a")
            a.href = `/api/fixed-costs/relatorios/export?${query.toString()}`
            a.click()
          }}
        >
          <FileSpreadsheet className="size-4" />
          Exportar Excel
        </Button>
      </CardContent>
    </Card>
  )
}
