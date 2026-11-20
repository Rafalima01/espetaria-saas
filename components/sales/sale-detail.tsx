"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Ban } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HoldButton } from "@/components/ui/hold-button"
import { PageHeader } from "@/components/layout/page-header"
import { StatusPill } from "@/components/ui/status-pill"
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
import { cn } from "@/lib/utils"

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

type ItemRow = {
  id: string
  name: string
  kind: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
  note: string | null
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
  const cancelled = sale.status === "CANCELLED"

  const rows: ItemRow[] = [
    ...sale.items.map((i) => ({
      id: i.id,
      name: i.product.name,
      kind: "Produto",
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discount: i.discount,
      total: i.total,
      note: i.note,
    })),
    ...sale.doseSaleItems.map((i) => ({
      id: i.id,
      name: i.product.name,
      kind: `${DOSE_MODE_LABELS[i.mode] ?? i.mode} (${i.volumeMl}ml)`,
      quantity: 1,
      unitPrice: i.unitPrice,
      discount: i.discount,
      total: i.total,
      note: i.note,
    })),
    ...sale.recipeSaleItems.map((i) => ({
      id: i.id,
      name: i.recipe.name,
      kind: "Receita",
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discount: i.discount,
      total: i.total,
      note: i.note,
    })),
  ]

  async function handleCancel() {
    // A confirmação vem do próprio botão, que só dispara depois de segurar.
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Venda #${sale.id.slice(-8)}`}
        description={`${new Date(sale.createdAt).toLocaleString("pt-BR")} · ${sale.user.name}`}
        backHref="/vendas"
        actions={
          <>
            <StatusPill tone={cancelled ? "danger" : "success"}>
              {cancelled ? "Cancelada" : "Concluída"}
            </StatusPill>
            {canCancel && !cancelled && (
              <HoldButton
                className="h-10 rounded-xl px-4"
                loading={cancelling}
                holdingLabel="Segure para cancelar…"
                onConfirm={handleCancel}
              >
                <Ban className="size-4" />
                {cancelling ? "Cancelando..." : "Segure para cancelar"}
              </HoldButton>
            )}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <Card className="gap-0 p-0">
          <CardHeader className="p-4">
            <CardTitle className="text-base">Itens</CardTitle>
          </CardHeader>
          <div className="border-t border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qtd.</TableHead>
                  <TableHead className="text-right">Preço unit.</TableHead>
                  <TableHead className="text-right">Desconto</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{row.name}</span>
                        <span className="text-xs text-muted-foreground">{row.kind}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.quantity}</TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {centsToBRL(row.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {row.discount ? centsToBRL(row.discount) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {centsToBRL(row.total)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.note ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className={cn(!cancelled && "surface-glow")}>
            <CardHeader>
              <CardTitle className="text-base">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{centsToBRL(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Desconto</span>
                <span className="tabular-nums">{centsToBRL(sale.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Acréscimo</span>
                <span className="tabular-nums">{centsToBRL(sale.surcharge)}</span>
              </div>
              <div className="mt-1 flex items-end justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Total</span>
                <span
                  className={cn(
                    "text-3xl font-semibold tracking-tight tabular-nums",
                    cancelled ? "text-muted-foreground line-through" : "text-primary"
                  )}
                >
                  {centsToBRL(sale.total)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {sale.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2">
                  <span className="text-muted-foreground">{PAYMENT_METHOD_LABELS[p.method] ?? p.method}</span>
                  <span className="font-medium tabular-nums">{centsToBRL(p.amount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
