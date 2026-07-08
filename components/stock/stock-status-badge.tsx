import { Badge } from "@/components/ui/badge"
import {
  getStockStatus,
  STOCK_STATUS_LABELS,
  STOCK_STATUS_EMOJI,
  STOCK_STATUS_BADGE_VARIANT,
} from "@/lib/stock/getStockStatus"

export function StockStatusBadge({ stock, minStock }: { stock: number; minStock: number }) {
  const status = getStockStatus(stock, minStock)
  return (
    <Badge variant={STOCK_STATUS_BADGE_VARIANT[status]}>
      {STOCK_STATUS_EMOJI[status]} {STOCK_STATUS_LABELS[status]}
    </Badge>
  )
}
