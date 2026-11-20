"use server"

import { headers } from "next/headers"
import { AuthError } from "next-auth"
import { signIn } from "@/auth"
import { blockedMinutes, clearFailures, recordFailure } from "@/lib/rate-limit"

// `email` is echoed back so the form can keep it after a failed attempt
// (React resets uncontrolled fields once the action finishes).
export type LoginState = { error?: string; email?: string } | undefined

const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES_PER_EMAIL = 5
const MAX_FAILURES_PER_IP = 20

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "Informe email e senha.", email }
  }

  const requestHeaders = await headers()
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const emailKey = `login:email:${email.toLowerCase()}`
  const ipKey = `login:ip:${ip}`

  const wait = Math.max(
    blockedMinutes(emailKey, MAX_FAILURES_PER_EMAIL),
    blockedMinutes(ipKey, MAX_FAILURES_PER_IP)
  )
  if (wait > 0) {
    return {
      error: `Muitas tentativas. Tente novamente em ${wait} ${wait === 1 ? "minuto" : "minutos"}.`,
      email,
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      recordFailure(emailKey, WINDOW_MS)
      recordFailure(ipKey, WINDOW_MS)
      return { error: "Email ou senha inválidos.", email }
    }
    // Login certo: signIn sinaliza o redirecionamento lançando um erro especial.
    clearFailures(emailKey)
    throw error
  }
}
