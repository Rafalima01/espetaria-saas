"use client"

import { useActionState, useEffect, useRef } from "react"
import Link from "next/link"
import { Lock, Mail } from "lucide-react"
import { loginAction, type LoginState } from "@/app/(auth)/login/actions"
import { Button } from "@/components/ui/button"
import {
  AUTH_BUTTON,
  AuthError,
  AuthField,
  AuthHeading,
} from "@/components/auth/auth-heading"

// Só o email fica guardado neste aparelho (nunca a senha), para agilizar o
// próximo acesso. Desmarcar apaga o que foi guardado.
const REMEMBER_KEY = "jp-espeto:remember-email"

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined
  )
  const emailRef = useRef<HTMLInputElement>(null)
  const rememberRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REMEMBER_KEY)
      if (saved && emailRef.current && !emailRef.current.value) {
        emailRef.current.value = saved
        if (rememberRef.current) rememberRef.current.checked = true
      }
    } catch {
      // Navegador sem armazenamento (aba privada): segue sem lembrar.
    }
  }, [])

  function rememberChoice() {
    try {
      if (rememberRef.current?.checked && emailRef.current?.value) {
        window.localStorage.setItem(REMEMBER_KEY, emailRef.current.value.trim())
      } else {
        window.localStorage.removeItem(REMEMBER_KEY)
      }
    } catch {
      // ignora: lembrar o email é só uma conveniência
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading
        title="Bem-vindo de volta"
        description="Entre para continuar o atendimento."
      />
      <form action={formAction} onSubmit={rememberChoice} className="flex flex-col gap-4">
        <AuthField
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          placeholder="Seu email"
          required
          autoComplete="email"
          key={state?.email ?? "initial"}
          defaultValue={state?.email}
        />
        <AuthField
          id="password"
          name="password"
          type="password"
          label="Senha"
          icon={Lock}
          placeholder="Sua senha"
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between gap-3 px-1 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
            <input
              ref={rememberRef}
              type="checkbox"
              className="size-4 rounded accent-primary"
            />
            Lembrar meu email
          </label>
          <Link
            href="/forgot-password"
            className="text-primary underline-offset-4 hover:underline"
          >
            Esqueci a senha
          </Link>
        </div>

        {state?.error && <AuthError>{state.error}</AuthError>}

        <Button type="submit" size="lg" className={AUTH_BUTTON} loading={isPending}>
          {isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  )
}
