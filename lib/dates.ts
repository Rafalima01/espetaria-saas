// Espetaria operates in Brazil (America/Sao_Paulo, fixed UTC-3, no DST since 2019).
// "Hoje"/"este mês" boundaries are computed from this fixed offset so they don't
// depend on the server's OS timezone.
const SAO_PAULO_OFFSET_MS = 3 * 60 * 60 * 1000

function nowInSaoPaulo(): Date {
  return new Date(Date.now() - SAO_PAULO_OFFSET_MS)
}

/** Returns [startUtc, endUtc) covering "today" in America/Sao_Paulo. */
export function getTodayRange(): { start: Date; end: Date } {
  const local = nowInSaoPaulo()
  const startLocal = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate()
  )
  const start = new Date(startLocal + SAO_PAULO_OFFSET_MS)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start, end }
}

/** Returns [startUtc, endUtc) covering "this month" in America/Sao_Paulo. */
export function getMonthRange(): { start: Date; end: Date } {
  const local = nowInSaoPaulo()
  const startLocal = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1)
  const endLocal = Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + 1, 1)
  return {
    start: new Date(startLocal + SAO_PAULO_OFFSET_MS),
    end: new Date(endLocal + SAO_PAULO_OFFSET_MS),
  }
}

/** Returns [startUtc, endUtc) covering the last N days (including today) in America/Sao_Paulo. */
export function getLastNDaysRange(days: number): { start: Date; end: Date } {
  const { end } = getTodayRange()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  return { start, end }
}

/** Formats a UTC Date as its America/Sao_Paulo "YYYY-MM-DD" bucket key. */
export function toSaoPauloDayKey(date: Date): string {
  const local = new Date(date.getTime() - SAO_PAULO_OFFSET_MS)
  return local.toISOString().slice(0, 10)
}

/** Formats a UTC Date as its America/Sao_Paulo hour-of-day (0-23). */
export function toSaoPauloHour(date: Date): number {
  const local = new Date(date.getTime() - SAO_PAULO_OFFSET_MS)
  return local.getUTCHours()
}

/**
 * Parses a "YYYY-MM-DD" date-only string (e.g. from an <input type="date">) as
 * local midnight in America/Sao_Paulo, returning the equivalent UTC instant.
 * Using `new Date("YYYY-MM-DD")` directly would parse it as UTC midnight, which
 * displays as the previous day once rendered back in a UTC-3 timezone.
 */
export function parseSaoPauloDateInput(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day) + SAO_PAULO_OFFSET_MS)
}
