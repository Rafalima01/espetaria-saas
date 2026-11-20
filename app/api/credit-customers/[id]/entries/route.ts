import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { forbiddenResponse, denyUnlessRole } from "@/lib/auth-guards"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  const denied = denyUnlessRole(session, ["ADMIN","MANAGER","CASHIER"])
  if (denied) return denied

  const { id } = await params
  const entries = await prisma.financialEntry.findMany({
    where: { creditCustomerId: id },
    include: { payments: true, sale: { select: { id: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(entries)
}
