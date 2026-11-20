import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getCustomerBalance } from "@/lib/fiado/getCustomerBalance"
import { forbiddenResponse, denyUnlessRole } from "@/lib/auth-guards"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  const denied = denyUnlessRole(session, ["ADMIN","MANAGER","CASHIER","WAITER"])
  if (denied) return denied

  const { id } = await params
  const customer = await prisma.creditCustomer.findUnique({ where: { id } })
  if (!customer) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

  const balance = await getCustomerBalance(prisma, id)
  return NextResponse.json({
    ...balance,
    creditLimit: customer.creditLimit,
    status: customer.status,
    overLimit: balance.balance > customer.creditLimit,
  })
}
