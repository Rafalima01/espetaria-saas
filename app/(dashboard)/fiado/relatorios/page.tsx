import { ReportsFilter } from "@/components/fiado/reports-filter"

export default function RelatoriosFiadoPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Relatórios de Fiado</h1>
        <p className="text-muted-foreground">
          Filtre por período e exporte em Excel ou impressão/PDF.
        </p>
      </div>
      <ReportsFilter />
    </div>
  )
}
