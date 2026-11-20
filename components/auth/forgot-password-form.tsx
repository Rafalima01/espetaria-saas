"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Mail } from "lucide-react"
import {
  requestPasswordResetAction,
  type ForgotPasswordState,
} from "@/app/(auth)/forgot-password/actions"
import { Button } from "@/components/ui/button"
import {
  AUTH_BUTTON,
  AuthBack,
  AuthField,
  AuthHeading,
} from "@/components/auth/auth-heading"

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<
    ForgotPasswordState,
    FormData
  >(requestPasswordResetAction, undefined)

  return (
    <div className="flex flex-col gap-8">
      <AuthBack />
      <AuthHeading
        title="Recuperar senha"
        description="Informe seu email para recuperar o acesso."
      />
      <form action={formAction} className="flex flex-col gap-4">
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
        {state?.message && (
          <p className="rounded-2xl bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
            {state.message}
          </p>
        )}
        {state?.resetLink && (
          <p className="text-sm">
            Modo dev (sem SMTP configurado):{" "}
            <Link
              href={state.resetLink}
              className="font-medium text-primary underline underline-offset-4"
            >
              abrir link de redefinição
            </Link>
          </p>
        )}
        <Button type="submit" size="lg" className={AUTH_BUTTON} loading={isPending}>
          {isPending ? "Enviando..." : "Continuar"}
        </Button>
      </form>
    </div>
  )
}
