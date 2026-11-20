"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { KeyRound } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RolePicker } from "@/components/users/role-picker"

const FIELD_INPUT = "h-10 rounded-xl bg-background"

type UserData = {
  id: string
  name: string
  email: string
  role: string
  active: boolean
}

export function UserEditForm({ user, isSelf }: { user: UserData; isSelf: boolean }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [role, setRole] = useState(user.role)
  const [active, setActive] = useState(user.active)
  const [resetSubmitting, setResetSubmitting] = useState(false)
  const [newPassword, setNewPassword] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const form = new FormData(e.currentTarget)
      const payload = {
        name: String(form.get("name") ?? ""),
        role,
        active,
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error?.formErrors?.[0] ?? data.error ?? "Erro ao atualizar usuário")
        return
      }
      toast.success("Usuário atualizado")
      router.push("/configuracoes/usuarios")
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetPassword() {
    if (newPassword.length < 8) {
      toast.error("A senha precisa ter pelo menos 8 caracteres")
      return
    }
    setResetSubmitting(true)
    try {
      const res = await fetch(`/api/users/${user.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error?.formErrors?.[0] ?? data.error ?? "Erro ao redefinir senha")
        return
      }
      toast.success("Senha redefinida")
      setNewPassword("")
    } finally {
      setResetSubmitting(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        <form id="user-edit-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" className={FIELD_INPUT} defaultValue={user.name} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" className={FIELD_INPUT} value={user.email} disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Perfil</CardTitle>
              <CardDescription>
                {isSelf
                  ? "Você não pode alterar seu próprio perfil."
                  : "Define o que esta pessoa pode acessar"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RolePicker value={role} onChange={setRole} disabled={isSelf} />
            </CardContent>
          </Card>
        </form>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Redefinir senha</CardTitle>
            <CardDescription>Define uma nova senha para este usuário agora</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 w-64 rounded-xl bg-background"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl px-4"
              loading={resetSubmitting}
              onClick={handleResetPassword}
            >
              <KeyRound className="size-4" />
              {resetSubmitting ? "Salvando..." : "Redefinir senha"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:sticky lg:top-0">
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Checkbox
                id="active"
                checked={active}
                onCheckedChange={(checked) => setActive(checked === true)}
                disabled={isSelf}
              />
              <Label htmlFor="active">Usuário ativo</Label>
            </div>
            {isSelf && (
              <p className="text-xs text-muted-foreground">Você não pode desativar a si mesmo.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              form="user-edit-form"
              loading={submitting}
              className="h-11 rounded-xl text-base font-semibold"
            >
              {submitting ? "Salvando..." : "Salvar alterações"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-xl"
              onClick={() => router.push("/configuracoes/usuarios")}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
