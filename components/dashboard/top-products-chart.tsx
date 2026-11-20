"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AXIS_TICK, TOOLTIP_STYLE } from "@/components/dashboard/chart-style"

export function TopProductsChart({
  data,
}: {
  data: { name: string; quantity: number }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Produtos mais vendidos</CardTitle>
        <CardDescription>Últimos 30 dias, por quantidade</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
            <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={AXIS_TICK}
              width={120}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--muted)", fillOpacity: 0.4 }} />
            <Bar dataKey="quantity" fill="var(--primary)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
