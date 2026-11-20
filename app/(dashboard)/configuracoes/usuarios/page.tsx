import Link from "next/link"
import { UserPlus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { UserTable } from "@/components/users/user-table"

export default async function UsuariosPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, active: true },
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usuários"
        description={`${users.length} usuário(s) cadastrado(s)`}
        actions={
          <Button
            className="h-10 rounded-xl px-4"
            render={<Link href="/configuracoes/usuarios/novo" />}
            nativeButton={false}
          >
            <UserPlus className="size-4" />
            Novo usuário
          </Button>
        }
      />
      <UserTable users={users} />
    </div>
  )
}
