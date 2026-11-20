"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const TABS = [
  { title: "Despesas fixas", href: "/financeiro/despesas-fixas" },
  { title: "Fluxo de caixa", href: "/financeiro/fluxo-de-caixa" },
  { title: "Relatórios", href: "/financeiro/despesas-fixas/relatorios" },
]

export function FinanceiroNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Seções do financeiro"
      className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-secondary p-1"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.title}
          </Link>
        )
      })}
    </nav>
  )
}
