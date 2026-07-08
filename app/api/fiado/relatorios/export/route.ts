import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { buildWorkbook } from "@/lib/export/xlsx"
import { FINANCIAL_ENTRY_STATUS_LABELS } from "@/lib/constants"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER", "CASHIER"])

    const fromParam = req.nextUrl.searchParams.get("from")
    const toParam = req.nextUrl.searchParams.get("to")
    const from = fromParam ? new Date(fromParam) : new Date(0)
    const to = toParam ? new Date(toParam) : new Date()

    const entries = await prisma.financialEntry.findMany({
      where: { type: "RECEIVABLE", createdAt: { gte: from, lte: to } },
      include: { creditCustomer: true, payments: true },
      orderBy: { createdAt: "desc" },
    })

    const entryRows = entries.map((e) => {
      const paid = e.payments.reduce((sum, p) => sum + p.amount, 0)
      return [
        e.createdAt.toLocaleDateString("pt-BR"),
        e.creditCustomer?.name ?? "-",
        e.description,
        e.amount / 100,
        paid / 100,
        FINANCIAL_ENTRY_STATUS_LABELS[e.status] ?? e.status,
        e.dueDate.toLocaleDateString("pt-BR"),
      ]
    })

    const customers = await prisma.creditCustomer.findMany({ orderBy: { name: "asc" } })
    const customerRows = customers.map((c) => [
      c.name,
      c.phone,
      c.creditLimit / 100,
      c.status === "BLOCKED" ? "Bloqueado" : "Ativo",
    ])

    const buffer = await buildWorkbook([
      {
        name: "Fiados",
        headers: ["Data", "Cliente", "Descrição", "Valor", "Pago", "Status", "Vencimento"],
        rows: entryRows,
        currencyColumns: [3, 4],
      },
      {
        name: "Clientes",
        headers: ["Nome", "Telefone", "Limite", "Status"],
        rows: customerRows,
        currencyColumns: [2],
      },
    ])

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="fiado-relatorio-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    })
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao exportar relatório" }, { status: 500 })
  }
}
