const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export function centsToBRL(cents: number): string {
  return formatter.format(cents / 100)
}

export function brlToCents(value: string): number {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(",", ".")
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0
}
