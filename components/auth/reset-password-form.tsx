"use client"

import { useActionState } from "react"
import Link from "next/link"
import { CheckCircle2, Lock } from "lucide-react"
import {
  resetPasswordAction,
  type ResetPasswordState,
} from "@/app/(auth)/reset-password/[token]/actions"
import { Button } from "@/components/ui/button"
import {
  AUTH_BUTTON,
  AuthBack,
  AuthError,
  AuthField,
  AuthHeading,
} from "@/components/auth/auth-heading"

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState<
    ResetPasswordState,
    FormData
  >(resetPasswordAction.bind(null, token), undefined)

  if (state?.success) {
    return (
      <div className="flex flex-col items-start gap-6">
        <span className="animate-check-pop flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-7" />
        </span>
        <AuthHeading title="Senha redefinida" description="Agora você já pode entrar com a nova senha." />
        <Button
          size="lg"
          className={AUTH_BUTTON}
          render={<Link href="/login" />}
          nativeButton={false}
        >
          Ir para o login
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthBack />
      <AuthHeading title="Nova senha" description="Escolha uma senha com pelo menos 8 caracteres." />
      <form action={formAction} className="flex flex-col gap-4">
        <AuthField
          id="password"
          name="password"
          type="password"
          label="Nova senha"
          icon={Lock}
          placeholder="Nova senha"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <AuthField
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirmar senha"
          icon={Lock}
          placeholder="Confirmar senha"
          required
          minLength={8}
          autoComplete="new-password"
        />
        {state?.error && <AuthError>{state.error}</AuthError>}
        <Button type="submit" size="lg" className={AUTH_BUTTON} loading={isPending}>
          {isPending ? "Salvando..." : "Redefinir senha"}
        </Button>
      </form>
    </div>
  )
}
