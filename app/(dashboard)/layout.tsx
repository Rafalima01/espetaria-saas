import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { getLowStockAlerts } from "@/lib/stock/getLowStockAlerts"
import { getFixedCostAlerts } from "@/lib/financeiro/getFixedCostAlerts"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const canSeeStockAlerts = ["ADMIN", "MANAGER"].includes(session.user.role)
  const [lowStockAlerts, fixedCostAlerts] = canSeeStockAlerts
    ? await Promise.all([getLowStockAlerts(), getFixedCostAlerts()])
    : [[], []]

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar role={session.user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          name={session.user.name ?? session.user.email ?? "Usuário"}
          role={session.user.role}
          lowStockAlerts={lowStockAlerts}
          fixedCostAlerts={fixedCostAlerts}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
