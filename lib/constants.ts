export const PRODUCT_CATEGORIES = [
  "Espetos",
  "Bebidas - Cerveja",
  "Refrigerantes",
  "Sucos",
  "Doses",
  "Porções",
  "Sobremesas",
  "Copos",
  "Gelo",
  "Whisky",
  "Vodka",
  "Gin",
  "Cachaça",
  "Rum",
  "Tequila",
  "Licor",
  "Energético",
  "Outros",
] as const

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  SIMPLE: "Produto Simples",
  FRACTIONAL: "Bebida Fracionada (Dose)",
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: "PIX",
  CASH: "Dinheiro",
  CREDIT: "Cartão Crédito",
  DEBIT: "Cartão Débito",
  VOUCHER: "Voucher",
  FIADO: "Fiado",
}

export const STOCK_MOVEMENT_TYPE_LABELS: Record<string, string> = {
  IN: "Entrada",
  OUT: "Saída",
  LOSS: "Perda",
  BREAKAGE: "Quebra",
  ADJUSTMENT: "Ajuste",
  SALE: "Venda",
}

// How many units above minStock still count as "Baixo" (yellow) rather than
// "Normal" (green). Not yet exposed as a per-tenant setting — change here to
// tune it store-wide.
export const LOW_STOCK_BUFFER = 3

export const BOTTLE_CATEGORY_LABELS: Record<string, string> = {
  WHISKY: "Whisky",
  VODKA: "Vodka",
  GIN: "Gin",
  CACHACA: "Cachaça",
  RUM: "Rum",
  TEQUILA: "Tequila",
  LICOR: "Licor",
  ENERGETICO: "Energético",
  REFRIGERANTE: "Refrigerante",
  OUTROS: "Outros",
}

export const BOTTLE_MOVEMENT_TYPE_LABELS: Record<string, string> = {
  IN: "Entrada",
  LOSS: "Perda",
  ADJUSTMENT: "Ajuste",
  OPEN: "Abertura",
  DOSE_SALE: "Venda de dose",
  HALF_BOTTLE_SALE: "Venda meia garrafa",
  FULL_BOTTLE_SALE: "Venda garrafa inteira",
  RECIPE_SALE: "Venda de receita",
  RESTORE: "Estorno",
}

export const FINANCIAL_ENTRY_STATUS_LABELS: Record<string, string> = {
  OPEN: "Em aberto",
  PARTIALLY_PAID: "Parcialmente pago",
  PAID: "Pago",
  CANCELLED: "Cancelado",
}
