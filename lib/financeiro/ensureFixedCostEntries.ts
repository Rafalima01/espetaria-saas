import { prisma } from "@/lib/prisma"
import { getMonthRange, toSaoPauloDayKey, parseSaoPauloDateInput } from "@/lib/dates"

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

function nextCompetencia(competencia: string): string {
  const [year, month] = competencia.split("-").map(Number)
  return month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`
}

/**
 * Lazily backfills one FinancialEntry (type PAYABLE) per month, from each fixed
 * cost's creation month through the current month. Idempotent via the
 * @@unique([fixedCostId, competencia]) constraint — there's no cron/worker in
 * this deployment, so generation happens on read instead of on a schedule.
 */
export async function ensureFixedCostEntries(): Promise<void> {
  const fixedCosts = await prisma.fixedCost.findMany({ where: { active: true } })
  if (fixedCosts.length === 0) return

  const currentCompetencia = competenciaOf(getMonthRange().start)

  for (const fixedCost of fixedCosts) {
    let competencia = competenciaOf(fixedCost.createdAt)
    while (competencia <= currentCompetencia) {
      await prisma.financialEntry.upsert({
        where: { fixedCostId_competencia: { fixedCostId: fixedCost.id, competencia } },
        create: {
          type: "PAYABLE",
          description: `${fixedCost.name} - ${competencia}`,
          amount: fixedCost.monthlyAmount,
          status: "OPEN",
          dueDate: dueDateFor(competencia, fixedCost.dueDay),
          fixedCostId: fixedCost.id,
          competencia,
        },
        update: {},
      })
      competencia = nextCompetencia(competencia)
    }
  }
}
