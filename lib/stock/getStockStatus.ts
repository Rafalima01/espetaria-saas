import { LOW_STOCK_BUFFER } from "@/lib/constants"

export type StockStatus = "NORMAL" | "LOW" | "CRITICAL"

export function getStockStatus(stock: number, minStock: number): StockStatus {
  if (stock <= minStock) return "CRITICAL"
  if (stock <= minStock + LOW_STOCK_BUFFER) return "LOW"
  return "NORMAL"
}

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  NORMAL: "Normal",
  LOW: "Baixo",
  CRITICAL: "Crítico",
}

export const STOCK_STATUS_EMOJI: Record<StockStatus, string> = {
  NORMAL: "🟢",
  LOW: "🟡",
  CRITICAL: "🔴",
}

export const STOCK_STATUS_BADGE_VARIANT: Record<StockStatus, "default" | "secondary" | "destructive"> = {
  NORMAL: "default",
  LOW: "secondary",
  CRITICAL: "destructive",
}
