import { CreditCustomerForm } from "@/components/fiado/credit-customer-form"

export default function NovoClienteFiadoPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Novo cliente fiado</h1>
      <CreditCustomerForm />
    </div>
  )
}
