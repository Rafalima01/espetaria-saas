import { PageHeader } from "@/components/layout/page-header"
import { CreditCustomerForm } from "@/components/fiado/credit-customer-form"

export default function NovoClienteFiadoPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Novo cliente"
        description="Cadastre quem pode comprar no fiado"
        backHref="/fiado"
      />
      <CreditCustomerForm />
    </div>
  )
}
