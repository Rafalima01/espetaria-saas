"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Os dois ícones ficam empilhados e trocam com escala + desfoque (swap de ícone).
const ICON =
  "absolute size-4 transition-[opacity,transform,filter] duration-250 ease-in-out"
const HIDDEN = "scale-[0.25] opacity-0 blur-[2px]"
const SHOWN = "scale-100 opacity-100 blur-0"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const dark = mounted && resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Alternar tema"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <span className="relative flex size-4 items-center justify-center">
        <Sun className={cn(ICON, dark ? SHOWN : HIDDEN)} />
        <Moon className={cn(ICON, dark ? HIDDEN : SHOWN)} />
      </span>
    </Button>
  )
}
