"use client"

import { useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/components/layout/nav-items"

export function SidebarNav({
  role,
  collapsed = false,
  onNavigate,
}: {
  role: string
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)
  const placed = useRef(false)

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role))
  const groups = Array.from(new Set(items.map((i) => i.group)))
  // Se mais de um prefixo casar, vale o mais específico.
  const routeHref = items
    .filter((i) => pathname.startsWith(i.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  // Ao clicar, o destaque já desliza para o item novo, sem esperar a tela
  // carregar. Vale só enquanto a rota ainda é a mesma de antes do clique.
  const [pending, setPending] = useState<{ href: string; from: string } | null>(null)
  const activeHref = pending && pending.from === pathname ? pending.href : routeHref

  // O destaque é um único elemento que desliza até o item ativo, em vez de
  // cada item acender e apagar sozinho (o que dava a impressão de "pulo").
  useLayoutEffect(() => {
    const nav = navRef.current
    const pill = pillRef.current
    if (!nav || !pill) return

    function place(instant: boolean) {
      const active = nav!.querySelector<HTMLElement>('[aria-current="page"]')
      if (!active) {
        pill!.style.opacity = "0"
        return
      }
      // Sem animar na primeira posição, nem enquanto o menu muda de largura.
      const skip = instant || !placed.current
      if (skip) pill!.style.transition = "none"
      pill!.style.opacity = "1"
      pill!.style.width = `${active.offsetWidth}px`
      pill!.style.height = `${active.offsetHeight}px`
      pill!.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`
      if (skip) {
        void pill!.offsetWidth
        pill!.style.transition = ""
      }
      placed.current = true
    }

    place(false)
    // O observador avisa uma vez logo ao começar a observar; só interessam as
    // mudanças de tamanho depois disso (menu recolhendo ou expandindo).
    let initialNotice = true
    const observer = new ResizeObserver(() => {
      if (initialNotice) {
        initialNotice = false
        return
      }
      place(true)
    })
    nav.querySelectorAll("a").forEach((a) => observer.observe(a))
    return () => observer.disconnect()
  }, [activeHref, collapsed, role])

  return (
    <nav ref={navRef} className="relative flex flex-col gap-5 p-3">
      <span
        ref={pillRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 rounded-xl bg-primary opacity-0 shadow-[0_0_24px_-6px_var(--primary)] transition-[transform,width,height,opacity] duration-250 ease-(--ease-smooth-out)"
      />
      {groups.map((group) => (
        <div key={group} className="flex flex-col gap-1">
          {collapsed ? (
            <div className="mx-auto mb-1 h-px w-6 bg-border" />
          ) : (
            <span className="px-3 pb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              {group}
            </span>
          )}
          {items
            .filter((i) => i.group === group)
            .map((item) => {
              const active = item.href === activeHref
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setPending({ href: item.href, from: pathname })
                    onNavigate?.()
                  }}
                  title={collapsed ? item.title : undefined}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative z-10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                    collapsed && "justify-center px-0",
                    active
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )}
                >
                  <Icon className="size-[18px] shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              )
            })}
        </div>
      ))}
    </nav>
  )
}
