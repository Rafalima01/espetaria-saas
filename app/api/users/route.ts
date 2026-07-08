import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createUserSchema } from "@/lib/validations/user"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

export async function GET() {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN"])

    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    })
    return NextResponse.json(users)
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao listar usuários" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN"])

    const body = await req.json()
    const parsed = createUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { password, ...data } = parsed.data
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { ...data, passwordHash },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Email já cadastrado." }, { status: 409 })
    }
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
  }
}
