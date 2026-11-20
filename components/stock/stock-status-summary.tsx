import { Card } from "@/components/ui/card"
import { STOCK_STATUS_LABELS, type StockStatus } from "@/lib/stock/getStockStatus"
import { STOCK_STATUS_STYLE } from "@/components/stock/stock-status-badge"
import { cn } from "@/lib/utils"

const ORDER: StockStatus[] = ["NORMAL", "LOW", "CRITICAL"]

export function StockStatusSummary({
  counts,
}: {
  counts: { NORMAL: number; LOW: number; CRITICAL: number }
}) {
  const total = counts.NORMAL + counts.LOW + counts.CRITICAL

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {ORDER.map((status) => {
        const pct = total > 0 ? Math.round((counts[status] / total) * 100) : 0
        return (
          <Card key={status} className="gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {STOCK_STATUS_LABELS[status]}
              </span>
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  STOCK_STATUS_STYLE[status]
                )}
              >
                <span className="size-2.5 rounded-full bg-current" aria-hidden />
              </span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-semibold tracking-tight tabular-nums">
                {counts[status]}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {pct}% dos produtos ativos
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn("h-full rounded-full bg-current", STOCK_STATUS_STYLE[status].split(" ")[1])}
                style={{ width: `${pct}%` }}
              />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
