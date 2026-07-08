"use client"

import { useEffect } from "react"
import "./globals.css"

// Catches errors thrown by the root layout itself, which app/error.tsx cannot
// intercept — must render its own <html>/<body> since it replaces the root layout.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center text-foreground">
        <h1 className="text-2xl font-semibold">Algo deu errado</h1>
        <p className="max-w-md text-muted-foreground">
          Ocorreu um erro inesperado ao carregar a aplicação. Tente recarregar a página.
        </p>
        <button
          onClick={() => reset()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Tentar novamente
        </button>
      </body>
    </html>
  )
}
