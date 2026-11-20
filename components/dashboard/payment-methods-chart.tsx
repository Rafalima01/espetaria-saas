"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { centsToBRL } from "@/lib/money"
import { CHART_COLORS, TOOLTIP_STYLE } from "@/components/dashboard/chart-style"

export function PaymentMethodsChart({
  data,
}: {
  data: { method: string; total: number }[]
}) {
  const total = data.reduce((sum, d) => sum + d.total, 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Formas de pagamento</CardTitle>
        <CardDescription>Hoje</CardDescription>
      </CardHeader>
      {data.length === 0 ? (
        <CardContent className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          Nenhuma venda hoje ainda.
        </CardContent>
      ) : (
        <CardContent className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative h-52 w-52 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="method"
                  innerRadius={64}
                  outerRadius={96}
                  paddingAngle={3}
                  cornerRadius={6}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={entry.method} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => centsToBRL(Number(value) * 100)}
                  contentStyle={TOOLTIP_STYLE}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-semibold tabular-nums">
                {centsToBRL(Math.round(total * 100))}
              </span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>
          <ul className="flex w-full flex-col gap-2.5 text-sm">
            {data.map((d, index) => (
              <li key={d.method} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  {d.method}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {total > 0 ? Math.round((d.total / total) * 100) : 0}%
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  )
}
