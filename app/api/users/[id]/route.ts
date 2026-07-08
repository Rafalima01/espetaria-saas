import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { updateUserSchema } from "@/lib/validations/user"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN"])

    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    })
    if (!user) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    const authed = requireRole(session, ["ADMIN"])

    const { id } = await params
    const body = await req.json()
    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // Prevent an admin from locking themselves out by demoting/deactivating
    // their own account when they're the only one making the change.
    if (id === authed.user!.id) {
      if (parsed.data.active === false) {
        return NextResponse.json(
          { error: "Você não pode desativar o próprio usuário." },
          { status: 400 }
        )
      }
      if (parsed.data.role && parsed.data.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Você não pode remover seu próprio acesso de administrador." },
          { status: 400 }
        )
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 })
  }
}
