"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const TABS = [
  { title: "Despesas Fixas", href: "/financeiro/despesas-fixas" },
  { title: "Fluxo de Caixa", href: "/financeiro/fluxo-de-caixa" },
  { title: "Relatórios", href: "/financeiro/despesas-fixas/relatorios" },
]

export function FinanceiroNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 border-b">
      {TABS.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.title}
          </Link>
        )
      })}
    </nav>
  )
}
