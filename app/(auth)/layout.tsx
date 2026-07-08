export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Espetaria SaaS</h1>
          <p className="text-sm text-muted-foreground">
            Gestão completa para espetarias e bares
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
