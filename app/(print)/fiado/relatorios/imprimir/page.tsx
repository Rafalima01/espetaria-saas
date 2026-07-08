import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { centsToBRL } from "@/lib/money"
import { FINANCIAL_ENTRY_STATUS_LABELS } from "@/lib/constants"
import { PrintTrigger } from "@/components/fiado/print-trigger"

export default async function ImprimirRelatorioFiadoPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { from: fromParam, to: toParam } = await searchParams
  const from = fromParam ? new Date(fromParam) : new Date(0)
  const to = toParam ? new Date(toParam) : new Date()

  const entries = await prisma.financialEntry.findMany({
    where: { type: "RECEIVABLE", createdAt: { gte: from, lte: to } },
    include: { creditCustomer: true, payments: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <PrintTrigger />
      <h1 className="text-xl font-semibold">Relatório de Fiado</h1>
      <p className="mb-4 text-sm text-gray-600">
        Período: {from.toLocaleDateString("pt-BR")} a {to.toLocaleDateString("pt-BR")}
      </p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-400 text-left">
            <th className="py-1 pr-2">Data</th>
            <th className="py-1 pr-2">Cliente</th>
            <th className="py-1 pr-2">Descrição</th>
            <th className="py-1 pr-2">Valor</th>
            <th className="py-1 pr-2">Pago</th>
            <th className="py-1 pr-2">Status</th>
            <th className="py-1">Vencimento</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const paid = e.payments.reduce((sum, p) => sum + p.amount, 0)
            return (
              <tr key={e.id} className="border-b border-gray-200">
                <td className="py-1 pr-2">{e.createdAt.toLocaleDateString("pt-BR")}</td>
                <td className="py-1 pr-2">{e.creditCustomer?.name ?? "-"}</td>
                <td className="py-1 pr-2">{e.description}</td>
                <td className="py-1 pr-2">{centsToBRL(e.amount)}</td>
                <td className="py-1 pr-2">{centsToBRL(paid)}</td>
                <td className="py-1 pr-2">{FINANCIAL_ENTRY_STATUS_LABELS[e.status] ?? e.status}</td>
                <td className="py-1">{e.dueDate.toLocaleDateString("pt-BR")}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
