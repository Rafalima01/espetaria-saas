import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="max-w-md text-muted-foreground">
        A página que você procura não existe ou foi movida.
      </p>
      <Button render={<Link href="/" />} nativeButton={false}>
        Ir para o início
      </Button>
    </div>
  )
}
