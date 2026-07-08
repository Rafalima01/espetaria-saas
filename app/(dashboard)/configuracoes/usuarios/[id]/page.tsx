import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
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
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Editar usuário</h1>
      <UserEditForm user={user} isSelf={session?.user?.id === user.id} />
    </div>
  )
}
