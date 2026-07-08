import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { UserTable } from "@/components/users/user-table"

export default async function UsuariosPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, active: true },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Usuários</h1>
          <p className="text-muted-foreground">{users.length} usuário(s) cadastrado(s)</p>
        </div>
        <Button render={<Link href="/configuracoes/usuarios/novo" />} nativeButton={false}>
          Novo usuário
        </Button>
      </div>
      <UserTable users={users} />
    </div>
  )
}
