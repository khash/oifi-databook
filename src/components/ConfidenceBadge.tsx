import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const VERIFIED_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="#0d9488"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-block flex-shrink-0"
    aria-label="Confirmed"
  >
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export function ConfidenceBadge({ confidence }: { confidence: string }) {
  if (confidence === "confirmed") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-help">{VERIFIED_ICON}</span>
          </TooltipTrigger>
          <TooltipContent>Confirmed — backed by public evidence</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Badge
      variant="outline"
      className={
        confidence === "alleged"
          ? "border-amber-500 text-amber-700"
          : confidence === "disputed"
            ? "border-blue-500 text-blue-700"
            : "border-gray-400 text-gray-500"
      }
    >
      {confidence}
    </Badge>
  )
}
