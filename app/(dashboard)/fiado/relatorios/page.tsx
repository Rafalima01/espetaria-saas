import { PageHeader } from "@/components/layout/page-header"
import { ReportsFilter } from "@/components/fiado/reports-filter"

export default function RelatoriosFiadoPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Relatórios de fiado"
        description="Filtre por período e exporte em Excel ou impressão/PDF."
        backHref="/fiado"
      />
      <ReportsFilter />
    </div>
  )
}
