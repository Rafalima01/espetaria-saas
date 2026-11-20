import Link from "next/link"
import { Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Compass className="size-7" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Página não encontrada</h1>
        <p className="max-w-md text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
      </div>
      <Button className="h-10 rounded-xl px-5" render={<Link href="/" />} nativeButton={false}>
        Ir para o início
      </Button>
    </div>
  )
}
