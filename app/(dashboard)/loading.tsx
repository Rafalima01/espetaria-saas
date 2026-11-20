import { Skeleton } from "@/components/ui/skeleton"

// Mostrado enquanto a próxima tela carrega, no lugar de uma tela em branco.
export default function DashboardLoading() {
  return (
    <div data-skeleton className="flex flex-col gap-6" role="status" aria-label="Carregando">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
      <span className="sr-only">Carregando…</span>
    </div>
  )
}
