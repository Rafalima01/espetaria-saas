import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { STOCK_MOVEMENT_TYPE_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

type MovementRow = {
  id: string
  type: string
  quantity: number
  reason: string | null
  saleId: string | null
  createdAt: Date
  product: { name: string }
  user: { name: string }
}

const TYPE_STYLE: Record<string, string> = {
  IN: "bg-success/15 text-success",
  SALE: "bg-secondary text-secondary-foreground",
  OUT: "bg-destructive/15 text-destructive",
  LOSS: "bg-destructive/15 text-destructive",
  BREAKAGE: "bg-destructive/15 text-destructive",
  ADJUSTMENT: "bg-warning/15 text-warning",
}

export function StockMovementTable({ movements }: { movements: MovementRow[] }) {
  if (movements.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-muted-foreground">
        Nenhuma movimentação registrada.
      </Card>
    )
  }

  return (
    <Card className="gap-0 p-0">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Data</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Motivo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="text-muted-foreground">
                {new Date(m.createdAt).toLocaleString("pt-BR")}
              </TableCell>
              <TableCell className="font-medium">{m.product.name}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex h-5 items-center rounded-full px-2 text-xs font-medium whitespace-nowrap",
                    TYPE_STYLE[m.type] ?? "bg-secondary text-secondary-foreground"
                  )}
                >
                  {STOCK_MOVEMENT_TYPE_LABELS[m.type] ?? m.type}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">{m.quantity}</TableCell>
              <TableCell className="text-muted-foreground">{m.user.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {m.saleId ? (
                  <Link
                    href={`/vendas/${m.saleId}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Venda #{m.saleId.slice(-6)}
                  </Link>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="max-w-64 truncate text-muted-foreground">
                {m.reason ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
