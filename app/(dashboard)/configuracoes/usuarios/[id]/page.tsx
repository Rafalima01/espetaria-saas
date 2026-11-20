import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/layout/page-header"
import { UserEditForm } from "@/components/users/user-edit-form"

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [session, user] = await Promise.all([
    auth(),
    prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, active: true },
    }),
  ])
  if (!user) notFound()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={user.name}
        description="Editar usuário"
        backHref="/configuracoes/usuarios"
      />
      <UserEditForm user={user} isSelf={session?.user?.id === user.id} />
    </div>
  )
}
