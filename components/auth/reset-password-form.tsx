"use client"

import { useActionState } from "react"
import Link from "next/link"
import {
  resetPasswordAction,
  type ResetPasswordState,
} from "@/app/(auth)/reset-password/[token]/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState<
    ResetPasswordState,
    FormData
  >(resetPasswordAction.bind(null, token), undefined)

  if (state?.success) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 text-center">
          <p className="text-sm">Senha redefinida com sucesso.</p>
          <Link href="/login" className="text-sm font-medium text-primary underline">
            Ir para o login
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Salvando..." : "Redefinir senha"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
