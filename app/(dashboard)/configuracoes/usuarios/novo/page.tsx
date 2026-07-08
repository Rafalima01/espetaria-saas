import { UserForm } from "@/components/users/user-form"

export default function NovoUsuarioPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Novo usuário</h1>
      <UserForm />
    </div>
  )
}
