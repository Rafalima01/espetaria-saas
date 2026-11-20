"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { centsToBRL } from "@/lib/money"
import { AXIS_TICK, CHART_COLORS, TOOLTIP_STYLE } from "@/components/dashboard/chart-style"

type MonthPoint = { competencia: string; total: number }
type CategoryPoint = { category: string; total: number }

const BRL = (value: unknown) => centsToBRL(Number(value) * 100)

function MonthBars({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: -8, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="competencia" tick={AXIS_TICK} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={48} />
        <Tooltip formatter={BRL} contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--muted)", fillOpacity: 0.4 }} />
        <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function FixedCostReportsCharts({
  byMonth,
  byCategory,
  evolution,
  comparison,
}: {
  byMonth: MonthPoint[]
  byCategory: CategoryPoint[]
  evolution: MonthPoint[]
  comparison: MonthPoint[]
}) {
  if (byMonth.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Nenhum custo fixo lançado ainda.
        </CardContent>
      </Card>
    )
  }

  const categoryTotal = byCategory.reduce((sum, c) => sum + c.total, 0)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custos fixos por mês</CardTitle>
          <CardDescription>Total por competência</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <MonthBars data={byMonth} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custos por categoria</CardTitle>
          <CardDescription>Participação de cada categoria no total</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative h-52 w-52 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="total"
                  nameKey="category"
                  innerRadius={64}
                  outerRadius={96}
                  paddingAngle={3}
                  cornerRadius={6}
                  stroke="none"
                >
                  {byCategory.map((entry, index) => (
                    <Cell key={entry.category} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={BRL} contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-semibold tabular-nums">
                {centsToBRL(Math.round(categoryTotal * 100))}
              </span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>
          <ul className="flex max-h-52 w-full flex-col gap-2.5 overflow-y-auto text-sm">
            {byCategory.map((c, index) => (
              <li key={c.category} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="truncate">{c.category}</span>
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {categoryTotal > 0 ? Math.round((c.total / categoryTotal) * 100) : 0}%
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolução dos custos</CardTitle>
          <CardDescription>Tendência ao longo dos meses</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolution} margin={{ left: -8, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="fillFixedCostEvolution" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="competencia" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={48} />
              <Tooltip
                formatter={BRL}
                contentStyle={TOOLTIP_STYLE}
                cursor={{ stroke: "var(--primary)", strokeOpacity: 0.3 }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fill="url(#fillFixedCostEvolution)"
                activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparativo entre meses</CardTitle>
          <CardDescription>Um mês ao lado do outro</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <MonthBars data={comparison} />
        </CardContent>
      </Card>
    </div>
  )
}
