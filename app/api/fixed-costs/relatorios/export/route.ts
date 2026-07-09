import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { buildWorkbook } from "@/lib/export/xlsx"
import { FINANCIAL_ENTRY_STATUS_LABELS } from "@/lib/constants"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"
import { parseSaoPauloDateInput } from "@/lib/dates"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER"])

    const fromParam = req.nextUrl.searchParams.get("from")
    const toParam = req.nextUrl.searchParams.get("to")
    const from = fromParam ? parseSaoPauloDateInput(fromParam) : new Date(0)
    const to = toParam ? parseSaoPauloDateInput(toParam) : new Date()

    const entries = await prisma.financialEntry.findMany({
      where: { type: "PAYABLE", competencia: { not: null }, dueDate: { gte: from, lte: to } },
      include: { fixedCost: true, payments: true },
      orderBy: { dueDate: "desc" },
    })

    const entryRows = entries.map((e) => {
      const paid = e.payments.reduce((sum, p) => sum + p.amount, 0)
      return [
        e.competencia ?? "-",
        e.fixedCost?.name ?? e.description,
        e.fixedCost?.category ?? "-",
        e.amount / 100,
        paid / 100,
        FINANCIAL_ENTRY_STATUS_LABELS[e.status] ?? e.status,
        e.dueDate.toLocaleDateString("pt-BR"),
      ]
    })

    const byCategory = new Map<string, number>()
    const byMonth = new Map<string, number>()
    for (const e of entries) {
      const category = e.fixedCost?.category ?? "Outros"
      byCategory.set(category, (byCategory.get(category) ?? 0) + e.amount)
      const competencia = e.competencia ?? "-"
      byMonth.set(competencia, (byMonth.get(competencia) ?? 0) + e.amount)
    }

    const categoryRows = [...byCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([category, total]) => [category, total / 100])

    const monthRows = [...byMonth.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, total]) => [month, total / 100])

    const buffer = await buildWorkbook([
      {
        name: "Lançamentos",
        headers: ["Competência", "Custo fixo", "Categoria", "Valor", "Pago", "Status", "Vencimento"],
        rows: entryRows,
        currencyColumns: [3, 4],
      },
      {
        name: "Por categoria",
        headers: ["Categoria", "Total"],
        rows: categoryRows,
        currencyColumns: [1],
      },
      {
        name: "Por mês",
        headers: ["Competência", "Total"],
        rows: monthRows,
        currencyColumns: [1],
      },
    ])

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="custos-fixos-relatorio-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    })
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao exportar relatório" }, { status: 500 })
  }
}
