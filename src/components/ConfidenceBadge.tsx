import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function SealIcon({ fill, label }: { fill: string; label: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={fill}
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block flex-shrink-0"
      aria-label={label}
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function WarningIcon({ fill, label }: { fill: string; label: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={fill}
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block flex-shrink-0"
      aria-label={label}
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

const CONFIDENCE_CONFIG: Record<string, { icon: React.ReactNode; tooltip: string }> = {
  confirmed: {
    icon: <SealIcon fill="#0d9488" label="Confirmed" />,
    tooltip: "Confirmed — backed by public evidence",
  },
  alleged: {
    icon: <WarningIcon fill="#d97706" label="Alleged" />,
    tooltip: "Alleged — not yet independently confirmed",
  },
  disputed: {
    icon: <WarningIcon fill="#3b82f6" label="Disputed" />,
    tooltip: "Disputed — conflicting accounts exist",
  },
}

export function ConfidenceBadge({ confidence }: { confidence: string }) {
  const config = CONFIDENCE_CONFIG[confidence] ?? {
    icon: <WarningIcon fill="#9ca3af" label={confidence} />,
    tooltip: confidence,
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help">{config.icon}</span>
        </TooltipTrigger>
        <TooltipContent>{config.tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
