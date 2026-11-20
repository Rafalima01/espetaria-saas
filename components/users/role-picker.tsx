"use client"

import { ROLES } from "@/lib/validations/user"
import { ROLE_LABELS } from "@/components/layout/nav-items"
import { cn } from "@/lib/utils"

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN: "Acesso total, incluindo a gestão de usuários.",
  MANAGER: "Acesso total, menos a gestão de usuários.",
  CASHIER: "PDV, Vendas e Fiado.",
  WAITER: "Apenas o PDV.",
}

export function RolePicker({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (role: string) => void
  disabled?: boolean
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Perfil">
      {ROLES.map((role) => {
        const active = value === role
        return (
          <button
            key={role}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(role)}
            className={cn(
              "flex flex-col gap-0.5 rounded-2xl p-3 text-left ring-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60",
              active
                ? "bg-primary/10 ring-primary/60"
                : "bg-secondary/60 ring-foreground/10 hover:ring-primary/40"
            )}
          >
            <span className={cn("text-sm font-medium", active && "text-primary")}>
              {ROLE_LABELS[role]}
            </span>
            <span className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</span>
          </button>
        )
      })}
    </div>
  )
}
