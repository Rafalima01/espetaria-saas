import { Card } from "@/components/ui/card"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export function SummaryCard({
  title,
  value,
  icon: Icon,
  hint,
  highlight = false,
}: {
  title: string
  value: string
  icon?: LucideIcon
  hint?: string
  highlight?: boolean
}) {
  return (
    <Card
      className={cn(
        "gap-3 p-4 sm:p-5",
        highlight && "surface-glow ring-primary/30"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        {Icon && (
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              highlight
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-primary"
            )}
          >
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div className="truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl" title={value}>
        <AnimatedNumber text={value} />
      </div>
      {hint && <p className="-mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  )
}
