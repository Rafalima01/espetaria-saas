"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ArrowRight,
  ClipboardList,
  Download,
  Moon,
  PackagePlus,
  Calculator,
  FileText,
  Search,
  UserPlus,
  Plus,
  Sun,
  type LucideIcon,
} from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { NAV_ITEMS } from "@/components/layout/nav-items"
import { cn } from "@/lib/utils"

type Command = {
  id: string
  label: string
  group: "Ir para" | "Ações"
  icon: LucideIcon
  roles?: string[]
  href?: string
  run?: () => void
  keywords?: string
}

// Evento não padronizado de instalação do app (Chrome, Edge e Android).
type InstallPromptEvent = Event & { prompt: () => Promise<void> }

const ALL_ROLES = ["ADMIN", "MANAGER", "CASHIER", "WAITER"]

const ACTIONS: Command[] = [
  { id: "a-venda", label: "Nova venda", group: "Ações", icon: Plus, href: "/pdv", roles: ALL_ROLES, keywords: "pdv caixa vender" },
  { id: "a-produto", label: "Novo produto", group: "Ações", icon: PackagePlus, href: "/produtos/novo", roles: ["ADMIN", "MANAGER"], keywords: "cadastrar item" },
  { id: "a-receita", label: "Nova receita", group: "Ações", icon: Plus, href: "/receitas/novo", roles: ["ADMIN", "MANAGER"], keywords: "copão drink" },
  { id: "a-cliente", label: "Novo cliente do fiado", group: "Ações", icon: UserPlus, href: "/fiado/clientes/novo", roles: ["ADMIN", "MANAGER", "CASHIER"], keywords: "cadastrar fiado" },
  { id: "a-custo", label: "Novo custo fixo", group: "Ações", icon: Plus, href: "/financeiro/despesas-fixas/novo", roles: ["ADMIN", "MANAGER"], keywords: "despesa aluguel energia" },
  { id: "a-perda", label: "Registrar perda, quebra ou ajuste", group: "Ações", icon: ClipboardList, href: "/estoque/nova-movimentacao", roles: ["ADMIN", "MANAGER"], keywords: "estoque desperdício" },
  { id: "a-usuario", label: "Novo usuário", group: "Ações", icon: UserPlus, href: "/configuracoes/usuarios/novo", roles: ["ADMIN"], keywords: "equipe acesso" },
  { id: "a-simulador", label: "Simulador de lucro", group: "Ações", icon: Calculator, href: "/doses/simulador", roles: ["ADMIN", "MANAGER"], keywords: "doses garrafa margem" },
  { id: "a-relatorio", label: "Relatórios do fiado", group: "Ações", icon: FileText, href: "/fiado/relatorios", roles: ["ADMIN", "MANAGER", "CASHIER"], keywords: "exportar excel pdf" },
  { id: "a-fluxo", label: "Fluxo de caixa", group: "Ações", icon: FileText, href: "/financeiro/fluxo-de-caixa", roles: ["ADMIN", "MANAGER"], keywords: "entradas saídas saldo" },
  { id: "a-mov", label: "Movimentações de estoque", group: "Ações", icon: ClipboardList, href: "/estoque/movimentacoes", roles: ["ADMIN", "MANAGER"], keywords: "histórico" },
]

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

export function CommandPalette({ role }: { role: string }) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  // O navegador avisa quando o app pode ser instalado; guardamos o convite
  // para oferecer "Instalar aplicativo" aqui na paleta.
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null)

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setInstallEvent(e as InstallPromptEvent)
    }
    function onInstalled() {
      setInstallEvent(null)
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = NAV_ITEMS.filter((i) => i.roles.includes(role)).map((i) => ({
      id: `n-${i.href}`,
      label: i.title,
      group: "Ir para",
      icon: i.icon,
      href: i.href,
    }))
    const actions = ACTIONS.filter((a) => a.roles?.includes(role))
    const theme: Command = {
      id: "a-tema",
      label: "Alternar tema claro e escuro",
      group: "Ações",
      icon: resolvedTheme === "dark" ? Sun : Moon,
      keywords: "aparência escuro claro",
      run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    }
    const install: Command[] = installEvent
      ? [
          {
            id: "a-instalar",
            label: "Instalar aplicativo neste aparelho",
            group: "Ações",
            icon: Download,
            keywords: "celular tela inicial app pwa",
            run: () => {
              installEvent.prompt()
              setInstallEvent(null)
            },
          },
        ]
      : []
    return [...nav, ...actions, ...install, theme]
  }, [role, resolvedTheme, setTheme, installEvent])

  const results = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return commands
    return commands.filter((c) => normalize(`${c.label} ${c.keywords ?? ""}`).includes(q))
  }, [commands, query])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setQuery("")
        setActive(0)
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    document.getElementById(`cmd-${results[active]?.id}`)?.scrollIntoView({ block: "nearest" })
  }, [active, results])

  function openPalette() {
    setQuery("")
    setActive(0)
    setOpen(true)
  }

  function runCommand(command: Command | undefined) {
    if (!command) return
    setOpen(false)
    if (command.href) router.push(command.href)
    else command.run?.()
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((i) => (results.length ? (i + 1) % results.length : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      runCommand(results[active])
    }
  }

  const groups = (["Ir para", "Ações"] as const).filter((g) => results.some((r) => r.group === g))

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        aria-label="Buscar telas e ações"
        className="flex h-9 items-center gap-2 rounded-xl bg-secondary/70 px-3 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary sm:w-64"
      >
        <Search className="size-4 shrink-0" />
        <span className="hidden flex-1 truncate text-left whitespace-nowrap sm:inline">
          Buscar telas e ações
        </span>
        <kbd className="hidden rounded-md bg-background px-1.5 py-0.5 text-[11px] font-medium sm:inline">
          Ctrl K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-[22%] gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
          <DialogTitle className="sr-only">Buscar telas e ações</DialogTitle>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              role="combobox"
              aria-expanded
              aria-controls="cmd-list"
              aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Para onde você quer ir?"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div id="cmd-list" role="listbox" className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                Nada encontrado para &quot;{query}&quot;.
              </p>
            )}
            {groups.map((group) => (
              <div key={group} className="flex flex-col">
                <span className="px-3 pt-2 pb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  {group}
                </span>
                {results
                  .filter((r) => r.group === group)
                  .map((command) => {
                    const index = results.indexOf(command)
                    const Icon = command.icon
                    const selected = index === active
                    return (
                      <button
                        key={command.id}
                        id={`cmd-${command.id}`}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onMouseMove={() => setActive(index)}
                        onClick={() => runCommand(command)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                          selected ? "bg-primary text-primary-foreground" : "text-foreground"
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="flex-1">{command.label}</span>
                        {selected && <ArrowRight className="size-3.5" />}
                      </button>
                    )
                  })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
            <span>↑↓ navegar</span>
            <span>Enter abrir</span>
            <span>Esc fechar</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
