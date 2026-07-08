import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { doseSizeSchema } from "@/lib/validations/dose"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

export async function GET() {
  const session = await auth()
  if (!session?.user) return forbiddenResponse("Não autenticado")

  const doseSizes = await prisma.doseSize.findMany({ orderBy: { volumeMl: "asc" } })
  return NextResponse.json(doseSizes)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER"])

    const body = await req.json()
    const parsed = doseSizeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const doseSize = await prisma.doseSize.create({ data: parsed.data })
    return NextResponse.json(doseSize, { status: 201 })
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Tamanho de dose já cadastrado." }, { status: 409 })
    }
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar tamanho de dose" }, { status: 500 })
  }
}
