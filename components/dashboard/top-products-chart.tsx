"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TopProductsChart({
  data,
}: {
  data: { name: string; quantity: number }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Produtos mais vendidos (30 dias)</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
            <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              fontSize={12}
              width={120}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="quantity" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
