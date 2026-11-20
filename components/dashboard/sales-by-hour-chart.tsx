"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { centsToBRL } from "@/lib/money"
import { AXIS_TICK, TOOLTIP_STYLE } from "@/components/dashboard/chart-style"

export function SalesByHourChart({ data }: { data: { hour: string; total: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Vendas por hora</CardTitle>
        <CardDescription>Hoje</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="hour" tick={AXIS_TICK} interval={2} tickLine={false} axisLine={false} />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={48} />
            <Tooltip
              formatter={(value) => centsToBRL(Number(value) * 100)}
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: "var(--muted)", fillOpacity: 0.4 }}
            />
            <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
