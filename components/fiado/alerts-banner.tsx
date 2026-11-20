import { AlertTriangle } from "lucide-react"
import type { CustomerAlerts } from "@/lib/fiado/getCustomerAlerts"

export function AlertsBanner({ alerts }: { alerts: CustomerAlerts }) {
  const messages: string[] = []
  if (alerts.overLimit) messages.push("Cliente acima do limite de crédito.")
  if (alerts.hasOverdue) messages.push("Cliente possui pagamento(s) em atraso.")
  if (alerts.manyOpenPurchases) {
    messages.push(`Cliente possui ${alerts.openPurchaseCount} compras em aberto.`)
  }

  if (messages.length === 0) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive ring-1 ring-destructive/30"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/15">
        <AlertTriangle className="size-4" />
      </span>
      <ul className="flex flex-col gap-1 self-center">
        {messages.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  )
}
