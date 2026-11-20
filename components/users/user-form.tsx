"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RolePicker } from "@/components/users/role-picker"

const FIELD_INPUT = "h-10 rounded-xl bg-background"

export function UserForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [role, setRole] = useState("WAITER")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const form = new FormData(e.currentTarget)
      const payload = {
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        role,
        active: true,
      }

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error?.formErrors?.[0] ?? data.error ?? "Erro ao criar usuário")
        return
      }

      toast.success("Usuário criado")
      router.push("/configuracoes/usuarios")
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acesso</CardTitle>
            <CardDescription>Dados que a pessoa usa para entrar</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" className={FIELD_INPUT} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" className={FIELD_INPUT} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                className={FIELD_INPUT}
                required
              />
              <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Perfil</CardTitle>
            <CardDescription>Define o que esta pessoa pode acessar</CardDescription>
          </CardHeader>
          <CardContent>
            <RolePicker value={role} onChange={setRole} />
          </CardContent>
        </Card>
      </div>

      <Card className="lg:sticky lg:top-0">
        <CardContent className="flex flex-col gap-2">
          <Button type="submit" loading={submitting} className="h-11 rounded-xl text-base font-semibold">
            {submitting ? "Salvando..." : "Criar usuário"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-10 rounded-xl"
            onClick={() => router.push("/configuracoes/usuarios")}
          >
            Cancelar
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
