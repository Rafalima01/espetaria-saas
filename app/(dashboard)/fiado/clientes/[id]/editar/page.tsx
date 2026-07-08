import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
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
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Editar cliente</h1>
      <CreditCustomerForm customer={customer} />
    </div>
  )
}
