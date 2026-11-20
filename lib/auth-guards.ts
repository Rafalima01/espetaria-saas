import { NextResponse } from "next/server"
import type { Session } from "next-auth"

export class ForbiddenError extends Error {}

/** Throws if the session is missing or its role isn't in `allowed`. Use inside API route handlers. */
export function requireRole(session: Session | null, allowed: string[]) {
  if (!session?.user) throw new ForbiddenError("Não autenticado")
  if (!allowed.includes(session.user.role)) {
    throw new ForbiddenError("Você não tem permissão para esta ação")
  }
  return session
}

export function forbiddenResponse(message = "Você não tem permissão para esta ação") {
  return NextResponse.json({ error: message }, { status: 403 })
}

/**
 * Versão sem exceção, para handlers GET: devolve a resposta de erro (401/403)
 * ou null quando o perfil da sessão está entre os permitidos.
 */
export function denyUnlessRole(session: Session | null, allowed: string[]) {
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }
  if (!allowed.includes(session.user.role)) return forbiddenResponse()
  return null
}
