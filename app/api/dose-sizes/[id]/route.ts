import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { requireRole, forbiddenResponse, ForbiddenError } from "@/lib/auth-guards"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    requireRole(session, ["ADMIN", "MANAGER"])

    const { id } = await params
    const body = await req.json()
    const doseSize = await prisma.doseSize.update({
      where: { id },
      data: { active: Boolean(body.active) },
    })
    return NextResponse.json(doseSize)
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenResponse(error.message)
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar tamanho de dose" }, { status: 500 })
  }
}
