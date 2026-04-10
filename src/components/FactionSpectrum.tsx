import { SPECTRUM_FACTIONS } from "@/lib/constants"
import type { Faction } from "@/lib/types"

export function FactionSpectrum({ faction }: { faction: Faction | null }) {
  if (!faction) return null
  const index = (SPECTRUM_FACTIONS as readonly string[]).indexOf(faction)
  if (index === -1) return null

  const pct = 10 + (index / (SPECTRUM_FACTIONS.length - 1)) * 80

  return (
    <span className="inline-flex h-5 items-center gap-1.5 rounded-4xl border border-border px-2 py-0.5 text-xs font-medium">
      <span className="relative h-1.5 w-10 shrink-0 rounded-full"
        style={{
          background: "linear-gradient(to right, #10b981, #14b8a6, #f59e0b, #f97316, #ef4444)",
        }}
      >
        <span
          className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-foreground"
          style={{ left: `${pct}%` }}
        />
      </span>
      <span className="text-secondary-foreground">
        {faction.replace(/-/g, " ")}
      </span>
    </span>
  )
}
