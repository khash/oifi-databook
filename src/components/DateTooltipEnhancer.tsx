import { useEffect, useState, useRef, useCallback } from "react"

/**
 * Enhances all static `.date-converted[title]` spans on the page with a
 * styled tooltip (matching shadcn/ui look) instead of the native browser title.
 * Uses a single floating tooltip element that repositions on hover.
 */
export function DateTooltipEnhancer() {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const show = useCallback((e: MouseEvent) => {
    const el = e.currentTarget as HTMLElement
    const persian = el.dataset.persian
    if (!persian) return
    const rect = el.getBoundingClientRect()
    setTooltip({
      text: persian,
      x: rect.left + rect.width / 2,
      y: rect.top,
    })
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setTooltip(null), 100)
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("span.date-converted[title]")
    els.forEach((el) => {
      // Move title to data attribute and remove native tooltip
      const persian = el.getAttribute("title")
      if (persian) {
        el.dataset.persian = persian
        el.removeAttribute("title")
      }
      el.addEventListener("mouseenter", show as EventListener)
      el.addEventListener("mouseleave", hide)
    })
    return () => {
      els.forEach((el) => {
        el.removeEventListener("mouseenter", show as EventListener)
        el.removeEventListener("mouseleave", hide)
      })
    }
  }, [show, hide])

  if (!tooltip) return null

  return (
    <div
      className="pointer-events-none fixed z-50 inline-flex w-fit items-center rounded-md bg-foreground px-3 py-1.5 text-xs text-background animate-in fade-in-0 zoom-in-95"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        transform: "translate(-50%, calc(-100% - 6px))",
      }}
    >
      <span dir="rtl" lang="fa">{tooltip.text}</span>
    </div>
  )
}
