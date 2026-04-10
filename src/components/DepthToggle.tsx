import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface DepthToggleProps {
  depth: 1 | 2 | 3
  onChange: (d: 1 | 2 | 3) => void
}

const OPTIONS = [1, 2, 3] as const

export function DepthToggle({ depth, onChange }: DepthToggleProps) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const justClosedRef = useRef(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div
      ref={ref}
      className="relative inline-flex"
      onMouseLeave={() => {
        setHovered(false)
        justClosedRef.current = false
      }}
    >
      {open ? (
        <div className="flex flex-col gap-1 rounded-md bg-background shadow-md border border-border p-1">
          {OPTIONS.map((d) => (
            <Button
              key={d}
              variant={d === depth ? "default" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0 text-xs"
              onClick={() => {
                onChange(d)
                setOpen(false)
                setHovered(false)
                justClosedRef.current = true
              }}
            >
              {d}°
            </Button>
          ))}
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs transition-all duration-200 ease-in-out overflow-hidden"
          onClick={() => setOpen(true)}
          onMouseEnter={() => {
            if (!justClosedRef.current) setHovered(true)
          }}
        >
          <span
            className="inline-grid transition-[grid-template-columns] duration-200 ease-in-out"
            style={{ gridTemplateColumns: hovered ? "1fr" : "0fr" }}
          >
            <span className="overflow-hidden whitespace-nowrap">Depth&nbsp;</span>
          </span>
          {depth}°
        </Button>
      )}
    </div>
  )
}
