import { formatDate } from "@/lib/date"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Props {
  date: string
  className?: string
}

export function FormattedDate({ date, className }: Props) {
  const { display, persian } = formatDate(date)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={className}>{display}</span>
        </TooltipTrigger>
        <TooltipContent>
          <span dir="rtl" lang="fa">{persian}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
