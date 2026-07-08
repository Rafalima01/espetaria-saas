import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { financialPaymentInputSchema } from "@/lib/validations/credit-customer"
import { recomputeEntryStatus } from "@/lib/fiado/recomputeEntryStatus"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    const authed = requireRole(session, ["ADMIN", "MANAGER", "CASHIER"])

    const { id: entryId } = await params
    const body = await req.json()
    const parsed = financialPaymentInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.financialPayment.create({
        data: {
          financialEntryId: entryId,
          amount: parsed.data.amount,
          method: parsed.data.method,
          note: parsed.data.note || undefined,
          userId: authed.user!.id,
        },
      })
      return recomputeEntryStatus(tx, entryId)
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao registrar recebimento" }, { status: 500 })
  }
}
