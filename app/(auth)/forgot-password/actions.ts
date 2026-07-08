"use server"

import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"

export type ForgotPasswordState = { resetLink?: string; message?: string } | undefined

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const genericMessage =
    "Se o email existir em nossa base, um link de recuperação foi gerado."

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { message: genericMessage }

  const token = randomUUID()
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  })

  const resetLink = `/reset-password/${token}`
  // TODO: enviar por email quando um provedor de SMTP estiver configurado.
  console.log(`[password-reset] link para ${email}: ${resetLink}`)

  return { message: genericMessage, resetLink }
}
