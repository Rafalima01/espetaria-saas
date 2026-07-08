"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { centsToBRL } from "@/lib/money"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"

type SaleDetailData = {
  id: string
  createdAt: Date
  status: string
  subtotal: number
  discount: number
  surcharge: number
  total: number
  user: { name: string }
  items: {
    id: string
    quantity: number
    unitPrice: number
    discount: number
    total: number
    note: string | null
    product: { name: string }
  }[]
  doseSaleItems: {
    id: string
    volumeMl: number
    unitPrice: number
    discount: number
    total: number
    note: string | null
    mode: string
    product: { name: string }
  }[]
  recipeSaleItems: {
    id: string
    quantity: number
    unitPrice: number
    discount: number
    total: number
    note: string | null
    recipe: { name: string }
  }[]
  payments: { id: string; method: string; amount: number }[]
}

const DOSE_MODE_LABELS: Record<string, string> = {
  DOSE: "Dose",
  HALF_BOTTLE: "Meia garrafa",
  FULL_BOTTLE: "Garrafa inteira",
}

export function SaleDetail({
  sale,
  canCancel,
}: {
  sale: SaleDetailData
  canCancel: boolean
}) {
  const router = useRouter()
  const [cancelling, setCancelling] = useState(false)

  async function handleCancel() {
    if (!confirm("Cancelar esta venda? O estoque dos itens será devolvido.")) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/sales/${sale.id}/cancel`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao cancelar venda")
        return
      }
      toast.success("Venda cancelada")
      router.refresh()
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>
            Venda #{sale.id.slice(-8)}{" "}
            <Badge
              className="ml-2"
              variant={sale.status === "CANCELLED" ? "destructive" : "default"}
            >
              {sale.status === "CANCELLED" ? "Cancelada" : "Concluída"}
            </Badge>
          </CardTitle>
          {canCancel && sale.status !== "CANCELLED" && (
            <Button variant="destructive" size="sm" disabled={cancelling} onClick={handleCancel}>
              {cancelling ? "Cancelando..." : "Cancelar venda"}
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
          <p>Vendedor: {sale.user.name}</p>
          <p>Data: {new Date(sale.createdAt).toLocaleString("pt-BR")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Preço unit.</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell className="text-muted-foreground">Produto</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{centsToBRL(item.unitPrice)}</TableCell>
                  <TableCell>{item.discount ? centsToBRL(item.discount) : "-"}</TableCell>
                  <TableCell className="font-medium">{centsToBRL(item.total)}</TableCell>
                  <TableCell className="text-muted-foreground">{item.note ?? "-"}</TableCell>
                </TableRow>
              ))}
              {sale.doseSaleItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {DOSE_MODE_LABELS[item.mode] ?? item.mode} ({item.volumeMl}ml)
                  </TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>{centsToBRL(item.unitPrice)}</TableCell>
                  <TableCell>{item.discount ? centsToBRL(item.discount) : "-"}</TableCell>
                  <TableCell className="font-medium">{centsToBRL(item.total)}</TableCell>
                  <TableCell className="text-muted-foreground">{item.note ?? "-"}</TableCell>
                </TableRow>
              ))}
              {sale.recipeSaleItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.recipe.name}</TableCell>
                  <TableCell className="text-muted-foreground">Receita</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{centsToBRL(item.unitPrice)}</TableCell>
                  <TableCell>{item.discount ? centsToBRL(item.discount) : "-"}</TableCell>
                  <TableCell className="font-medium">{centsToBRL(item.total)}</TableCell>
                  <TableCell className="text-muted-foreground">{item.note ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            {sale.payments.map((p) => (
              <div key={p.id} className="flex justify-between">
                <span className="text-muted-foreground">{PAYMENT_METHOD_LABELS[p.method]}</span>
                <span>{centsToBRL(p.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{centsToBRL(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Desconto</span>
              <span>{centsToBRL(sale.discount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Acréscimo</span>
              <span>{centsToBRL(sale.surcharge)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{centsToBRL(sale.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
