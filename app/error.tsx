"use client"

import { useEffect } from "react"
import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
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
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
        <TriangleAlert className="size-7" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Algo deu errado</h1>
        <p className="max-w-md text-muted-foreground">
          Ocorreu um erro inesperado. Você pode tentar novamente ou voltar para o início.
        </p>
      </div>
      <div className="flex gap-2">
        <Button className="h-10 rounded-xl px-5" onClick={() => reset()}>
          Tentar novamente
        </Button>
        <Button
          variant="outline"
          className="h-10 rounded-xl px-5"
          onClick={() => (window.location.href = "/")}
        >
          Ir para o início
        </Button>
      </div>
    </div>
  )
}
