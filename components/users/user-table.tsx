"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StatusPill, type PillTone } from "@/components/ui/status-pill"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ROLE_LABELS } from "@/components/layout/nav-items"
import { cn } from "@/lib/utils"

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  active: boolean
}

const ROLE_TONE: Record<string, PillTone> = {
  ADMIN: "primary",
  MANAGER: "primary",
  CASHIER: "neutral",
  WAITER: "neutral",
}

export function UserTable({ users }: { users: UserRow[] }) {
  if (users.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-muted-foreground">
        Nenhum usuário cadastrado.
      </Card>
    )
  }

  return (
    <Card className="gap-0 p-0">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Usuário</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className={cn(!user.active && "opacity-60")}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusPill tone={ROLE_TONE[user.role] ?? "neutral"} dot={false}>
                  {ROLE_LABELS[user.role] ?? user.role}
                </StatusPill>
              </TableCell>
              <TableCell>
                <StatusPill tone={user.active ? "success" : "neutral"}>
                  {user.active ? "Ativo" : "Inativo"}
                </StatusPill>
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <Button
                    render={<Link href={`/configuracoes/usuarios/${user.id}`} />}
                    nativeButton={false}
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${user.name}`}
                    title="Editar"
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
