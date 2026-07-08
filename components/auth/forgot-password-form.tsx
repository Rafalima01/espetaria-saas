"use client"

import { useActionState } from "react"
import Link from "next/link"
import {
  requestPasswordResetAction,
  type ForgotPasswordState,
} from "@/app/(auth)/forgot-password/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<
    ForgotPasswordState,
    FormData
  >(requestPasswordResetAction, undefined)

  return (
    <Card>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="voce@espetaria.com"
              required
              autoComplete="email"
            />
          </div>
          {state?.message && (
            <p className="text-sm text-muted-foreground">{state.message}</p>
          )}
          {state?.resetLink && (
            <p className="text-sm">
              Modo dev (sem SMTP configurado):{" "}
              <Link
                href={state.resetLink}
                className="font-medium text-primary underline"
              >
                abrir link de redefinição
              </Link>
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Enviando..." : "Enviar link de recuperação"}
          </Button>
          <Link
            href="/login"
            className="text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Voltar para o login
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
