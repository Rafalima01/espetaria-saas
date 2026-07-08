import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { STOCK_STATUS_EMOJI } from "@/lib/stock/getStockStatus"

export function StockStatusSummary({
  counts,
}: {
  counts: { NORMAL: number; LOW: number; CRITICAL: number }
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {STOCK_STATUS_EMOJI.NORMAL} Normal
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{counts.NORMAL}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {STOCK_STATUS_EMOJI.LOW} Baixo
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{counts.LOW}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {STOCK_STATUS_EMOJI.CRITICAL} Crítico
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{counts.CRITICAL}</CardContent>
      </Card>
    </div>
  )
}
