import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/layout/page-header"
import { CreditCustomerForm } from "@/components/fiado/credit-customer-form"

export default async function EditarClienteFiadoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const customer = await prisma.creditCustomer.findUnique({ where: { id } })
  if (!customer) notFound()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={customer.name}
        description="Editar cliente"
        backHref={`/fiado/clientes/${customer.id}`}
      />
      <CreditCustomerForm customer={customer} />
    </div>
  )
}
