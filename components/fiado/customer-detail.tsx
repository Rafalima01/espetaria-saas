"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertsBanner } from "@/components/fiado/alerts-banner"
import { StatementTable } from "@/components/fiado/statement-table"
import { ReceivePaymentDialog } from "@/components/fiado/receive-payment-dialog"
import { centsToBRL } from "@/lib/money"
import type { CustomerAlerts } from "@/lib/fiado/getCustomerAlerts"
import type { CustomerBalance } from "@/lib/fiado/getCustomerBalance"

type Entry = {
  id: string
  description: string
  amount: number
  status: string
  dueDate: Date
  createdAt: Date
  payments: { id: string; amount: number; createdAt: Date }[]
}

export function CustomerDetail({
  customer,
  entries,
  balance,
  alerts,
}: {
  customer: { id: string; name: string; phone: string; status: string; creditLimit: number }
  entries: Entry[]
  balance: CustomerBalance
  alerts: CustomerAlerts
}) {
  const [payOpen, setPayOpen] = useState(false)
  const openEntries = entries.filter((e) => e.status === "OPEN" || e.status === "PARTIALLY_PAID")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
          <p className="text-muted-foreground">{customer.phone}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={customer.status === "BLOCKED" ? "destructive" : "default"}>
            {customer.status === "BLOCKED" ? "Bloqueado" : "Ativo"}
          </Badge>
          <Button
            variant="outline"
            render={<Link href={`/fiado/clientes/${customer.id}/editar`} />}
            nativeButton={false}
          >
            Editar
          </Button>
          <Button disabled={openEntries.length === 0} onClick={() => setPayOpen(true)}>
            Registrar recebimento
          </Button>
        </div>
      </div>

      <AlertsBanner alerts={alerts} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo devedor
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">
            {centsToBRL(balance.balance)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Limite de crédito
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">
            {centsToBRL(customer.creditLimit)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total pago
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">
            {centsToBRL(balance.totalPaid)}
          </CardContent>
        </Card>
      </div>

      <StatementTable entries={entries} />

      <ReceivePaymentDialog open={payOpen} onOpenChange={setPayOpen} entries={openEntries} />
    </div>
  )
}
