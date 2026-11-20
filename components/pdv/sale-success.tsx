"use client"

import { centsToBRL } from "@/lib/money"

/**
 * Confirmação da venda: o check gira e se desenha sobre o carrinho, o valor
 * aparece e tudo some sozinho. Um toque dispensa antes.
 */
export function SaleSuccess({ total, onDone }: { total: number; onDone: () => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onDone}
      className="absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl bg-card/95 text-center"
    >
      <span className="animate-check-pop flex size-20 items-center justify-center rounded-full bg-success/15 text-success">
        <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path className="animate-check-draw" d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <div className="animate-pop-in flex flex-col gap-1" style={{ animationDelay: "var(--duration-micro)" }}>
        <span className="text-lg font-semibold">Venda concluída</span>
        <span className="text-2xl font-semibold text-primary tabular-nums">{centsToBRL(total)}</span>
      </div>
    </div>
  )
}
