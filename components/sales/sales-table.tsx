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
import { Button } from "@/components/ui/button"
import { centsToBRL } from "@/lib/money"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"

type SaleRow = {
  id: string
  createdAt: Date
  total: number
  status: string
  user: { name: string }
  payments: { method: string }[]
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  COMPLETED: "default",
  CANCELLED: "destructive",
  OPEN: "secondary",
}

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  OPEN: "Em aberto",
}

export function SalesTable({ sales }: { sales: SaleRow[] }) {
  if (sales.length === 0) {
    return <p className="text-muted-foreground">Nenhuma venda registrada.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {new Date(sale.createdAt).toLocaleString("pt-BR")}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {sale.id.slice(-8)}
              </TableCell>
              <TableCell>{sale.user.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {sale.payments.map((p) => PAYMENT_METHOD_LABELS[p.method]).join(" + ")}
              </TableCell>
              <TableCell className="font-medium">{centsToBRL(sale.total)}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[sale.status] ?? "secondary"}>
                  {STATUS_LABELS[sale.status] ?? sale.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/vendas/${sale.id}`} />}
                  nativeButton={false}
                >
                  Ver detalhes
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
