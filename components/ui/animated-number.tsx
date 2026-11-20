"use client"

import { useEffect, useRef } from "react"

// Aceita só textos que são um número com prefixo de moeda e/ou unidade curta
// ("R$ 3.617,12", "-R$ 11.476,40", "60ml", "16 doses", "42%"). Qualquer outro
// texto (nomes, "0ml / 0 un.") aparece como está, sem animação.
const PATTERN = /^(-?\s?(?:R\$\s?)?)(\d{1,3}(?:\.\d{3})*|\d+)(,\d+)?(\s?(?:ml|%|doses?|un\.?))?$/

function parseNumber(text: string) {
  const m = PATTERN.exec(text)
  if (!m) return null
  const [, prefix, integer, decimalPart, suffix] = m
  const decimals = decimalPart ? decimalPart.length - 1 : 0
  const value = Number(integer.replace(/\./g, "") + (decimalPart ? "." + decimalPart.slice(1) : ""))
  return { prefix, suffix: suffix ?? "", decimals, value }
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export function AnimatedNumber({ text, duration = 700 }: { text: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  // Último valor mostrado: a próxima animação parte dele, não do zero.
  const shown = useRef(0)

  useEffect(() => {
    const el = ref.current
    const parsed = parseNumber(text)
    if (!el || !parsed) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      shown.current = parsed.value
      return
    }

    const format = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: parsed.decimals,
      maximumFractionDigits: parsed.decimals,
    })
    const from = shown.current
    const to = parsed.value
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const current = from + (to - from) * easeOutCubic(t)
      shown.current = current
      el.textContent = parsed.prefix + format.format(current) + parsed.suffix
      if (t < 1) frame = requestAnimationFrame(tick)
      else el.textContent = text
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [text, duration])

  // O servidor renderiza o valor final (bom para leitores de tela e sem JS);
  // a animação só mexe no texto depois que a página carrega.
  return <span ref={ref}>{text}</span>
}
