"use server"

import { AuthError } from "next-auth"
import { signIn } from "@/auth"

export type LoginState = { error?: string } | undefined

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "Informe email e senha." }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email ou senha inválidos." }
    }
    throw error
  }
}
