import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { creditCustomerSchema } from "@/lib/validations/credit-customer"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return forbiddenResponse("Não autenticado")

  const { id } = await params
  const customer = await prisma.creditCustomer.findUnique({ where: { id } })
  if (!customer) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(customer)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER", "CASHIER"])

    const { id } = await params
    const body = await req.json()
    const parsed = creditCustomerSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const customer = await prisma.creditCustomer.update({
      where: { id },
      data: {
        ...data,
        whatsapp: data.whatsapp === "" ? null : data.whatsapp,
        cpf: data.cpf === "" ? null : data.cpf,
        address: data.address === "" ? null : data.address,
        notes: data.notes === "" ? null : data.notes,
      },
    })

    return NextResponse.json(customer)
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 })
  }
}
