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
    <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <ul className="flex flex-col gap-1">
        {messages.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  )
}
