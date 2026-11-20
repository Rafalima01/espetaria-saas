"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, type LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function AuthHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}

export function AuthBack({ href = "/login" }: { href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Voltar para o login"
      className="-mb-4 flex size-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors outline-none hover:bg-secondary/70 focus-visible:ring-2 focus-visible:ring-primary"
    >
      <ArrowLeft className="size-4" />
    </Link>
  )
}

/**
 * Campo em pílula com ícone, no estilo das telas de entrada. O rótulo fica só
 * para leitores de tela: o texto de exemplo dentro do campo faz o papel visual.
 */
export function AuthField({
  label,
  icon: Icon,
  type = "text",
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & {
  label: string
  icon: LucideIcon
  type?: "text" | "email" | "password"
}) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === "password"

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={props.id} className="sr-only">
        {label}
      </label>
      <Icon className="pointer-events-none absolute top-1/2 left-5 size-[18px] -translate-y-1/2 text-primary" />
      <Input
        {...props}
        type={isPassword && visible ? "text" : type}
        className="h-14 rounded-full border-transparent bg-secondary pr-12 pl-13 text-sm"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Esconder senha" : "Mostrar senha"}
          aria-pressed={visible}
          className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      )}
    </div>
  )
}

export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="animate-shake rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-destructive/30"
    >
      {children}
    </p>
  )
}

export const AUTH_BUTTON = "h-14 w-full rounded-full text-base font-semibold"
