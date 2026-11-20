import { cn } from "@/lib/utils"

export type PillTone = "success" | "warning" | "danger" | "neutral" | "primary"

const TONE: Record<PillTone, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
  neutral: "bg-secondary text-secondary-foreground",
  primary: "bg-primary/15 text-primary",
}

export function StatusPill({
  tone = "neutral",
  dot = true,
  className,
  children,
}: {
  tone?: PillTone
  dot?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap",
        TONE[tone],
        className
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}
