import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface DepthToggleProps {
  depth: 1 | 2 | 3
  onChange: (d: 1 | 2 | 3) => void
}

export function DepthToggle({ depth, onChange }: DepthToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={String(depth)}
      onValueChange={(v) => {
        if (v) onChange(Number(v) as 1 | 2 | 3)
      }}
      size="sm"
    >
      <ToggleGroupItem value="1" aria-label="Depth 1">
        1°
      </ToggleGroupItem>
      <ToggleGroupItem value="2" aria-label="Depth 2">
        2°
      </ToggleGroupItem>
      <ToggleGroupItem value="3" aria-label="Depth 3">
        3°
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
