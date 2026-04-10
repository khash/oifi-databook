import { Badge } from "@/components/ui/badge"
import type { EventType } from "@/lib/types"

export const EVENT_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  election: {
    label: "Election",
    className: "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400",
  },
  appointment: {
    label: "Appointment",
    className: "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-400",
  },
  purge: {
    label: "Purge",
    className: "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
  },
  protest: {
    label: "Protest",
    className: "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
  },
  leak: {
    label: "Leak",
    className: "border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-400",
  },
  policy: {
    label: "Policy",
    className: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
  },
  death: {
    label: "Death",
    className: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
  },
}

export function EventTypeBadge({ type }: { type: EventType }) {
  const config = EVENT_TYPE_CONFIG[type]
  if (!config) {
    return (
      <Badge variant="outline" className="text-[10px] font-semibold tracking-wide uppercase px-1.5 h-4">
        {type.replace(/-/g, " ")}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold tracking-wide uppercase px-1.5 h-4 ${config.className}`}>
      {config.label}
    </Badge>
  )
}
