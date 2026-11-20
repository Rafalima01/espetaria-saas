import {
  getStockStatus,
  STOCK_STATUS_LABELS,
  type StockStatus,
} from "@/lib/stock/getStockStatus"
import { cn } from "@/lib/utils"

export const STOCK_STATUS_STYLE: Record<StockStatus, string> = {
  NORMAL: "bg-success/15 text-success",
  LOW: "bg-warning/15 text-warning",
  CRITICAL: "bg-destructive/15 text-destructive",
}

export function StockStatusBadge({
  stock,
  minStock,
  className,
}: {
  stock: number
  minStock: number
  className?: string
}) {
  const status = getStockStatus(stock, minStock)
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap",
        STOCK_STATUS_STYLE[status],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {STOCK_STATUS_LABELS[status]}
    </span>
  )
}
