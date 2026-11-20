// O template é remontado a cada navegação. A animação de entrada fica no CSS
// (`[data-page] > *` em globals.css), então vale tanto para o carregamento
// quanto para o momento em que o conteúdo real troca o esqueleto.
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div data-page className="h-full">
      {children}
    </div>
  )
}
