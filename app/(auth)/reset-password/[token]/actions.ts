"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export type ResetPasswordState = { error?: string; success?: boolean } | undefined

export async function resetPasswordAction(
  token: string,
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")

  if (password.length < 8) {
    return { error: "A senha precisa ter pelo menos 8 caracteres." }
  }
  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." }
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  })

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt < new Date()
  ) {
    return { error: "Link de recuperação inválido ou expirado." }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ])

  return { success: true }
}
