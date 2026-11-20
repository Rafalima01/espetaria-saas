import Image from "next/image"

// Telas de entrada: uma coluna só, igual no celular e no computador.
// Logo no topo, formulário embaixo, brilho dourado no canto.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="surface-glow-tl relative flex min-h-dvh flex-1 flex-col items-center overflow-hidden px-6 py-10">
      <div className="flex w-full max-w-sm flex-1 flex-col justify-center gap-10">
        <Image
          src="/logo.jpg"
          alt="JP Espeto Bar"
          width={720}
          height={720}
          priority
          className="mx-auto size-28 rounded-[1.75rem] ring-1 ring-border"
        />
        {children}
      </div>
    </div>
  )
}
