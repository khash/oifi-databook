import { Badge } from "@/components/ui/badge"
import type { Faction } from "@/lib/types"

type NonNullFaction = NonNullable<Faction>

export const FACTION_CONFIG: Record<NonNullFaction, { label: string; className: string }> = {
  opposition: {
    label: "Opposition",
    className: "border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-400",
  },
  reformist: {
    label: "Reformist",
    className: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
  },
  pragmatist: {
    label: "Pragmatist",
    className: "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-400",
  },
  conservative: {
    label: "Conservative",
    className: "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
  },
  hardliner: {
    label: "Hardliner",
    className: "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
  },
}

export function FactionBadge({ faction }: { faction: NonNullFaction }) {
  const config = FACTION_CONFIG[faction]
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold tracking-wide uppercase px-1.5 h-4 ${config.className}`}>
      {config.label}
    </Badge>
  )
}
