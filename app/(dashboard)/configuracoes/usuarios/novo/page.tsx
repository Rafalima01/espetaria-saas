import { PageHeader } from "@/components/layout/page-header"
import { UserForm } from "@/components/users/user-form"

export default function NovoUsuarioPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Novo usuário"
        description="Crie o acesso de alguém da equipe"
        backHref="/configuracoes/usuarios"
      />
      <UserForm />
    </div>
  )
}
