import type { CSSProperties } from "react"

export const TOOLTIP_STYLE: CSSProperties = {
  fontSize: 12,
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  boxShadow: "0 8px 30px rgb(0 0 0 / 0.35)",
}

export const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 12 }

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]
