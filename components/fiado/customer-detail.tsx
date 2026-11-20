"use client"

import { useState } from "react"
import Link from "next/link"
import { HandCoins, Pencil, Wallet, CreditCard, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { StatusPill } from "@/components/ui/status-pill"
import { AlertsBanner } from "@/components/fiado/alerts-banner"
import { StatementTable } from "@/components/financeiro/statement-table"
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title={customer.name}
        description={customer.phone}
        backHref="/fiado"
        actions={
          <>
            {customer.status === "BLOCKED" ? (
              <StatusPill tone="danger">Bloqueado</StatusPill>
            ) : (
              <StatusPill tone="success">Ativo</StatusPill>
            )}
            <Button
              variant="outline"
              className="h-10 rounded-xl px-4"
              render={<Link href={`/fiado/clientes/${customer.id}/editar`} />}
              nativeButton={false}
            >
              <Pencil className="size-4" />
              Editar
            </Button>
            <Button
              className="h-10 rounded-xl px-4"
              disabled={openEntries.length === 0}
              onClick={() => setPayOpen(true)}
            >
              <HandCoins className="size-4" />
              Registrar recebimento
            </Button>
          </>
        }
      />

      <AlertsBanner alerts={alerts} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          highlight={balance.balance > 0}
          title="Saldo devedor"
          value={centsToBRL(balance.balance)}
          icon={Wallet}
        />
        <SummaryCard
          title="Limite de crédito"
          value={centsToBRL(customer.creditLimit)}
          icon={CreditCard}
        />
        <SummaryCard title="Total pago" value={centsToBRL(balance.totalPaid)} icon={CheckCircle2} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Extrato</h2>
        <StatementTable entries={entries} />
      </div>

      <ReceivePaymentDialog open={payOpen} onOpenChange={setPayOpen} entries={openEntries} />
    </div>
  )
}
