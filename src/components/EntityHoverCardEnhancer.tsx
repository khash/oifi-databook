import { useEffect, useState, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FactionSpectrum } from "@/components/FactionSpectrum"
import type { Faction } from "@/lib/types"

type EntitySummary =
  | {
      type: "person"
      slug: string
      name_en: string
      name_fa: string | null
      has_native_fa_name: boolean
      role: string | null
      faction: string | null
      irgc_member: boolean
      excerpt: string | null
    }
  | {
      type: "org"
      slug: string
      name_en: string
      name_fa: string | null
      has_native_fa_name: boolean
      org_type: string | null
      faction: string | null
      excerpt: string | null
    }
  | {
      type: "event"
      slug: string
      name_en: string
      event_type: string | null
      date: string | null
      excerpt: string | null
    }

type Summaries = Record<string, EntitySummary>

let summariesCache: Summaries | null = null

async function loadSummaries(): Promise<Summaries> {
  if (summariesCache) return summariesCache
  const res = await fetch("/entity-summaries.json")
  summariesCache = await res.json()
  return summariesCache!
}

function formatDate(date: string): string {
  if (/^\d{4}$/.test(date)) return date
  if (/^\d{4}-\d{2}$/.test(date)) {
    const [y, m] = date.split("-")
    return new Date(`${y}-${m}-01`).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
  }
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function EntityCard({ summary }: { summary: EntitySummary }) {
  const href =
    summary.type === "person"
      ? `/people/${summary.slug}`
      : summary.type === "org"
        ? `/orgs/${summary.slug}`
        : `/events/${summary.slug}`

  return (
    <Card size="sm" className="w-72 shadow-xl">
      <CardHeader>
        <CardTitle>
          <a href={href} className="hover:underline">
            {summary.name_en}
          </a>
        </CardTitle>

        {summary.type !== "event" && summary.has_native_fa_name && summary.name_fa && (
          <CardDescription>
            <span dir="rtl" lang="fa">{summary.name_fa}</span>
          </CardDescription>
        )}

        {summary.type === "person" && summary.role && (
          <CardDescription>{summary.role}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {summary.type === "person" && (
            <>
              {summary.faction && <FactionSpectrum faction={summary.faction as Faction} />}
              {summary.irgc_member && (
                <Badge variant="outline" className="text-[10px] font-normal px-1.5 h-4 border-green-600/40 text-green-700 dark:border-green-500/40 dark:text-green-400">
                  IRGC
                </Badge>
              )}
            </>
          )}
          {summary.type === "org" && summary.org_type && (
            <Badge variant="secondary" className="text-xs">
              {summary.org_type.replace(/-/g, " ")}
            </Badge>
          )}
          {summary.type === "event" && (
            <>
              {summary.event_type && (
                <Badge variant="secondary" className="text-xs">
                  {summary.event_type.replace(/-/g, " ")}
                </Badge>
              )}
              {summary.date && (
                <span className="text-xs text-muted-foreground">{formatDate(summary.date)}</span>
              )}
            </>
          )}
        </div>

        {summary.excerpt && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{summary.excerpt}</p>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Mounts globally in main.astro. Scans the DOM for a[data-entity-id] after mount
 * (populated by renderMarkdownWithEntities) and attaches hover card behavior.
 * No-op on touch/coarse-pointer devices.
 */
export function EntityHoverCardEnhancer() {
  const [active, setActive] = useState<{
    summary: EntitySummary
    x: number
    y: number
    anchorBottom: number
  } | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }, [])

  const hide = useCallback(() => {
    hideTimerRef.current = setTimeout(() => setActive(null), 150)
  }, [])

  const show = useCallback(async (e: MouseEvent) => {
    const el = e.currentTarget as HTMLAnchorElement
    const entityId = el.dataset.entityId
    if (!entityId) return
    cancelHide()
    const summaries = await loadSummaries()
    const summary = summaries[entityId]
    if (!summary) return
    const rect = el.getBoundingClientRect()
    setActive({
      summary,
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY,
      anchorBottom: rect.bottom,
    })
  }, [cancelHide])

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return

    const handleMouseEnter = (e: Event) => { void show(e as unknown as MouseEvent) }
    const els = document.querySelectorAll<HTMLAnchorElement>("a[data-entity-id]")
    els.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter)
      el.addEventListener("mouseleave", hide)
    })
    return () => {
      els.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter)
        el.removeEventListener("mouseleave", hide)
      })
    }
  }, [show, hide])

  if (!active) return null

  // Flip upward if card would go off-screen bottom
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800
  const cardHeight = 200 // approximate
  const spaceBelow = viewportHeight - active.anchorBottom
  const showAbove = spaceBelow < cardHeight + 16

  const top = showAbove
    ? active.y - cardHeight - (active.anchorBottom - (active.y - window.scrollY)) - 8
    : active.y + 8

  return createPortal(
    <div
      className="pointer-events-auto absolute z-50 animate-in fade-in-0 zoom-in-95"
      style={{ left: active.x, top }}
      onMouseEnter={cancelHide}
      onMouseLeave={hide}
    >
      <EntityCard summary={active.summary} />
    </div>,
    document.body,
  )
}
