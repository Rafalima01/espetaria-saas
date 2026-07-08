"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROLES } from "@/lib/validations/user"
import { ROLE_LABELS } from "@/components/layout/nav-items"

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
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" defaultValue={user.name} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Perfil</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v ?? user.role)}
                items={Object.fromEntries(ROLES.map((r) => [r, ROLE_LABELS[r]]))}
                disabled={isSelf}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isSelf && (
                <p className="text-xs text-muted-foreground">
                  Você não pode alterar seu próprio perfil.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Checkbox
                id="active"
                checked={active}
                onCheckedChange={(checked) => setActive(checked === true)}
                disabled={isSelf}
              />
              <Label htmlFor="active">Usuário ativo</Label>
              {isSelf && (
                <span className="text-xs text-muted-foreground">
                  (você não pode desativar a si mesmo)
                </span>
              )}
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar alterações"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/configuracoes/usuarios")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Redefinir senha</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-64"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={resetSubmitting}
            onClick={handleResetPassword}
          >
            {resetSubmitting ? "Salvando..." : "Redefinir senha"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
