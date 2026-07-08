import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { STOCK_MOVEMENT_TYPE_LABELS } from "@/lib/constants"

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

const TYPE_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  IN: "default",
  SALE: "secondary",
  OUT: "destructive",
  LOSS: "destructive",
  BREAKAGE: "destructive",
  ADJUSTMENT: "secondary",
}

export function StockMovementTable({ movements }: { movements: MovementRow[] }) {
  if (movements.length === 0) {
    return <p className="text-muted-foreground">Nenhuma movimentação registrada.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Motivo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {new Date(m.createdAt).toLocaleString("pt-BR")}
              </TableCell>
              <TableCell className="font-medium">{m.product.name}</TableCell>
              <TableCell>
                <Badge variant={TYPE_VARIANT[m.type] ?? "secondary"}>
                  {STOCK_MOVEMENT_TYPE_LABELS[m.type] ?? m.type}
                </Badge>
              </TableCell>
              <TableCell>{m.quantity}</TableCell>
              <TableCell className="text-muted-foreground">{m.user.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {m.saleId ? (
                  <Link href={`/vendas/${m.saleId}`} className="underline">
                    Venda #{m.saleId.slice(-6)}
                  </Link>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{m.reason ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
