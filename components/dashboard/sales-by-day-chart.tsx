"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { centsToBRL } from "@/lib/money"
import { AXIS_TICK, TOOLTIP_STYLE } from "@/components/dashboard/chart-style"

export function SalesByDayChart({ data }: { data: { day: string; total: number }[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Faturamento</CardTitle>
        <CardDescription>Últimos 14 dias</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillSalesDay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="day" tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={48} />
            <Tooltip
              formatter={(value) => centsToBRL(Number(value) * 100)}
              contentStyle={TOOLTIP_STYLE}
              cursor={{ stroke: "var(--primary)", strokeOpacity: 0.3 }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill="url(#fillSalesDay)"
              activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
