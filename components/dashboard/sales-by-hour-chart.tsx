"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { centsToBRL } from "@/lib/money"

export function SalesByHourChart({ data }: { data: { hour: string; total: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Vendas por hora (hoje)</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="hour" fontSize={12} interval={2} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              formatter={(value) => centsToBRL(Number(value) * 100)}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
