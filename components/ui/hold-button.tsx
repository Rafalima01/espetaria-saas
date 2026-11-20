"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Botão de ação destrutiva que só dispara depois de segurar pressionado.
 * Evita o clique por engano sem precisar de um "tem certeza?" separado:
 * a barra enche enquanto o botão está pressionado e some se soltar antes.
 * Funciona com mouse, toque e teclado (segurar Espaço ou Enter).
 */
export function HoldButton({
  onConfirm,
  holdMs = 900,
  loading = false,
  holdingLabel = "Segure…",
  className,
  children,
}: {
  onConfirm: () => void
  holdMs?: number
  loading?: boolean
  holdingLabel?: string
  className?: string
  children: React.ReactNode
}) {
  const [holding, setHolding] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function start() {
    if (loading || holding) return
    setHolding(true)
    timer.current = window.setTimeout(() => {
      setHolding(false)
      onConfirm()
    }, holdMs)
  }

  function cancel() {
    window.clearTimeout(timer.current)
    setHolding(false)
  }

  return (
    <Button
      variant="destructive"
      loading={loading}
      title="Segure para confirmar"
      className={cn("relative touch-manipulation overflow-hidden", className)}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault()
          start()
        }
      }}
      onKeyUp={cancel}
      onBlur={cancel}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-destructive/40"
        style={{
          width: holding ? "100%" : "0%",
          transition: holding
            ? `width ${holdMs}ms linear`
            : "width var(--duration-quick) var(--ease-smooth-out)",
        }}
      />
      <span className="relative flex items-center gap-1.5">
        {holding ? holdingLabel : children}
      </span>
    </Button>
  )
}
