"use client"

import { useActionState } from "react"
import { Lock, Mail, User } from "lucide-react"
import { setupAction, type SetupState } from "@/app/(auth)/setup/actions"
import { Button } from "@/components/ui/button"
import {
  AUTH_BUTTON,
  AuthError,
  AuthField,
  AuthHeading,
} from "@/components/auth/auth-heading"

export function SetupForm() {
  const [state, formAction, isPending] = useActionState<SetupState, FormData>(
    setupAction,
    undefined
  )

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading
        title="Criar administrador"
        description="Primeiro acesso: crie o login do administrador do sistema."
      />
      <form action={formAction} className="flex flex-col gap-4">
        <AuthField
          id="name"
          name="name"
          label="Nome"
          icon={User}
          placeholder="Seu nome"
          required
          autoComplete="name"
        />
        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          placeholder="Seu email"
          required
          autoComplete="email"
        />
        <AuthField
          id="password"
          name="password"
          type="password"
          label="Senha"
          icon={Lock}
          placeholder="Senha (mínimo de 8 caracteres)"
          required
          minLength={8}
          autoComplete="new-password"
        />
        {state?.error && <AuthError>{state.error}</AuthError>}
        <Button type="submit" size="lg" className={AUTH_BUTTON} loading={isPending}>
          {isPending ? "Criando..." : "Criar administrador e entrar"}
        </Button>
      </form>
    </div>
  )
}
