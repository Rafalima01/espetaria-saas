"use server"

import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"

export type ForgotPasswordState = { resetLink?: string; message?: string } | undefined

const isProduction = process.env.NODE_ENV === "production"

// A resposta é a mesma exista o email ou não, para não revelar quem tem conta.
const GENERIC_MESSAGE = isProduction
  ? "Se o email estiver cadastrado, peça a um administrador para redefinir sua senha em Configurações, Usuários."
  : "Se o email existir em nossa base, um link de recuperação foi gerado."

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  // Ainda não há envio de email. Em produção NÃO se gera nem se devolve link:
  // entregar o link na resposta deixaria qualquer pessoa trocar a senha de
  // qualquer conta só sabendo o email. O administrador redefine a senha pelo
  // sistema (Configurações, Usuários).
  if (isProduction) return { message: GENERIC_MESSAGE }

  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { message: GENERIC_MESSAGE }

  const token = randomUUID()
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  })

  // Só desenvolvimento: sem SMTP, o link aparece na tela para facilitar os testes.
  const resetLink = `/reset-password/${token}`
  console.log(`[password-reset] link para ${email}: ${resetLink}`)

  return { message: GENERIC_MESSAGE, resetLink }
}
