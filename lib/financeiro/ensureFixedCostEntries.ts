import { prisma } from "@/lib/prisma"
import { getMonthRange, toSaoPauloDayKey, parseSaoPauloDateInput } from "@/lib/dates"

const MONTH_STEP: Record<string, number> = {
  MONTHLY: 1,
  BIMONTHLY: 2,
  QUARTERLY: 3,
  SEMIANNUAL: 6,
  ANNUAL: 12,
}

const DAY_STEP: Record<string, number> = {
  WEEKLY: 7,
  BIWEEKLY: 14,
}

function competenciaOf(date: Date): string {
  return toSaoPauloDayKey(date).slice(0, 7) // "YYYY-MM"
}

function lastDayOfMonth(year: number, month: number): number {
  // `month` is 1-indexed here; Date.UTC's month param is 0-indexed, so passing
  // it as-is with day 0 lands on the last day of the *previous* (i.e. target) month.
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function dueDateFor(competencia: string, dueDay: number): Date {
  const [year, month] = competencia.split("-").map(Number)
  const day = Math.min(dueDay, lastDayOfMonth(year, month))
  return parseSaoPauloDateInput(`${competencia}-${String(day).padStart(2, "0")}`)
}

function nextCompetencia(competencia: string, stepMonths: number): string {
  const [year, month] = competencia.split("-").map(Number)
  const totalMonths = year * 12 + (month - 1) + stepMonths
  const nextYear = Math.floor(totalMonths / 12)
  const nextMonth = (totalMonths % 12) + 1
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}`
}

async function upsertEntry(fixedCostId: string, name: string, amount: number, competencia: string, dueDate: Date) {
  await prisma.financialEntry.upsert({
    where: { fixedCostId_competencia: { fixedCostId, competencia } },
    create: {
      type: "PAYABLE",
      description: `${name} - ${competencia}`,
      amount,
      status: "OPEN",
      dueDate,
      fixedCostId,
      competencia,
    },
    update: {},
  })
}

/**
 * Lazily backfills one FinancialEntry (type PAYABLE) per occurrence, from each
 * fixed cost's creation through now, according to its recurrence. Idempotent via
 * the @@unique([fixedCostId, competencia]) constraint — there's no cron/worker in
 * this deployment, so generation happens on read instead of on a schedule.
 *
 * WEEKLY/BIWEEKLY use the exact occurrence date ("YYYY-MM-DD") as competencia,
 * since multiple occurrences can fall in the same month. MONTHLY-and-coarser
 * recurrences keep the original "YYYY-MM" competencia format (this is the only
 * path that existed before recurrence was introduced — MONTHLY's behavior here
 * is byte-for-byte identical to the original implementation).
 */
export async function ensureFixedCostEntries(): Promise<void> {
  const fixedCosts = await prisma.fixedCost.findMany({ where: { active: true } })
  if (fixedCosts.length === 0) return

  const now = new Date()

  for (const fixedCost of fixedCosts) {
    if (fixedCost.recurrence in DAY_STEP) {
      const stepMs = DAY_STEP[fixedCost.recurrence] * 24 * 60 * 60 * 1000
      let dueDate = fixedCost.createdAt
      while (dueDate <= now) {
        await upsertEntry(fixedCost.id, fixedCost.name, fixedCost.amount, toSaoPauloDayKey(dueDate), dueDate)
        dueDate = new Date(dueDate.getTime() + stepMs)
      }
    } else {
      const stepMonths = MONTH_STEP[fixedCost.recurrence]
      const currentCompetencia = competenciaOf(getMonthRange().start)
      let competencia = competenciaOf(fixedCost.createdAt)
      while (competencia <= currentCompetencia) {
        const dueDate = dueDateFor(competencia, fixedCost.dueDay ?? 1)
        await upsertEntry(fixedCost.id, fixedCost.name, fixedCost.amount, competencia, dueDate)
        competencia = nextCompetencia(competencia, stepMonths)
      }
    }
  }
}
