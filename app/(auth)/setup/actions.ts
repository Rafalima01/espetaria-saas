"use server"

import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

const setupSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(120),
  email: z
    .string()
    .email("Email inválido")
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres"),
})

export type SetupState = { error?: string } | undefined

export async function setupAction(
  _prevState: SetupState,
  formData: FormData
): Promise<SetupState> {
  // Re-check on every submit — this route must never create a second user.
  const userCount = await prisma.user.count()
  if (userCount > 0) {
    return { error: "Já existe um administrador cadastrado. Use a tela de login." }
  }

  const parsed = setupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "ADMIN",
      active: true,
    },
  })

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Administrador criado, mas o login automático falhou. Faça login manualmente." }
    }
    throw error
  }
}
