"use client"

import { useState } from "react"
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
      <CardContent className="flex flex-wrap items-end gap-3 pt-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="from">De (vencimento)</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="to">Até (vencimento)</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button
          type="button"
          onClick={() => {
            const a = document.createElement("a")
            a.href = `/api/fixed-costs/relatorios/export?${query.toString()}`
            a.click()
          }}
        >
          Exportar Excel
        </Button>
      </CardContent>
    </Card>
  )
}
