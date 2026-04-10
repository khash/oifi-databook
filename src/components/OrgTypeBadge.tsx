import { Badge } from "@/components/ui/badge"
import type { OrgType } from "@/lib/types"

export const ORG_TYPE_CONFIG: Record<OrgType, { label: string; className: string }> = {
  "political-party": {
    label: "Political Party",
    className: "border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-400",
  },
  "state-institution": {
    label: "State Institution",
    className: "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-400",
  },
  military: {
    label: "Military",
    className: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
  },
  media: {
    label: "Media",
    className: "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
  },
  business: {
    label: "Business",
    className: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
  },
  ngo: {
    label: "NGO",
    className: "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400",
  },
  religious: {
    label: "Religious",
    className: "border-teal-200 bg-teal-50 text-teal-600 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-400",
  },
}

export function OrgTypeBadge({ type }: { type: OrgType }) {
  const config = ORG_TYPE_CONFIG[type]
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold tracking-wide uppercase px-1.5 h-4 ${config.className}`}>
      {config.label}
    </Badge>
  )
}
