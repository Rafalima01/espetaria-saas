import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { creditCustomerSchema } from "@/lib/validations/credit-customer"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return forbiddenResponse("Não autenticado")

  const search = req.nextUrl.searchParams.get("search") ?? undefined
  const customers = await prisma.creditCustomer.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
  })

  return NextResponse.json(customers)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER", "CASHIER"])

    const body = await req.json()
    const parsed = creditCustomerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const customer = await prisma.creditCustomer.create({
      data: {
        ...data,
        whatsapp: data.whatsapp || undefined,
        cpf: data.cpf || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 })
  }
}
