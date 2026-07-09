"use client"

import { useActionState } from "react"
import { setupAction, type SetupState } from "@/app/(auth)/setup/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function SetupForm() {
  const [state, formAction, isPending] = useActionState<SetupState, FormData>(
    setupAction,
    undefined
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar administrador</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Primeiro acesso — crie o login do administrador do sistema.
          </p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
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
            {isPending ? "Criando..." : "Criar administrador e entrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
