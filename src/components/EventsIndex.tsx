import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FormattedDate } from "@/components/FormattedDate"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EVENT_TYPES } from "@/lib/constants"
import type { EventType } from "@/lib/types"

interface EventItem {
  slug: string
  name: string
  date: string
  type: EventType
  connectionCount: number
}

type SortKey = "date-desc" | "date-asc" | "name" | "connections"
type ViewMode = "list" | "table"

export function EventsIndex({ events }: { events: EventItem[] }) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sort, setSort] = useState<SortKey>("date-desc")
  const [view, setView] = useState<ViewMode>("list")

  const filtered = useMemo(() => {
    let result = events

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((e) => e.name.toLowerCase().includes(q))
    }

    if (typeFilter !== "all") {
      result = result.filter((e) => e.type === typeFilter)
    }

    result = [...result].sort((a, b) => {
      if (sort === "date-desc") return b.date.localeCompare(a.date)
      if (sort === "date-asc") return a.date.localeCompare(b.date)
      if (sort === "name") return a.name.localeCompare(b.name)
      return b.connectionCount - a.connectionCount || a.name.localeCompare(b.name)
    })

    return result
  }, [events, search, typeFilter, sort])

  // Group by year when sorted by date
  const grouped = useMemo(() => {
    if (sort !== "date-desc" && sort !== "date-asc") return null
    const groups: Record<string, EventItem[]> = {}
    for (const e of filtered) {
      const year = e.date.slice(0, 4)
      ;(groups[year] ??= []).push(e)
    }
    return groups
  }, [filtered, sort])

  const years = grouped
    ? Object.keys(grouped).sort((a, b) =>
        sort === "date-asc" ? a.localeCompare(b) : b.localeCompare(a),
      )
    : []

  return (
    <TooltipProvider>
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold">Events</h1>
          <span className="text-sm text-muted-foreground">
            {filtered.length} of {events.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Filter by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48"
          />

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace(/-/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="name">A–Z</SelectItem>
              <SelectItem value="connections">By connections</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-input p-0.5">
            <button
              onClick={() => setView("list")}
              className={`rounded-md p-1.5 transition-colors ${view === "list" ? "bg-accent" : "hover:bg-accent/50"}`}
              aria-label="List view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
            </button>
            <button
              onClick={() => setView("table")}
              className={`rounded-md p-1.5 transition-colors ${view === "table" ? "bg-accent" : "hover:bg-accent/50"}`}
              aria-label="Table view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="3" y2="21"/></svg>
            </button>
          </div>
        </div>

        {grouped && years.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {years.map((y) => (
              <a
                key={y}
                href={`#year-${y}`}
                className="flex h-7 items-center justify-center rounded-md px-2 text-xs font-medium hover:bg-accent transition-colors"
              >
                {y}
              </a>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No events match your filters.</p>
      )}

      {view === "table" && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-left font-medium">Date</th>
                <th className="px-3 py-2 text-left font-medium">Type</th>
                <th className="px-3 py-2 text-right font-medium">Links</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.slug} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2">
                    <a href={`/events/${e.slug}`} className="hover:underline font-medium">
                      {e.name}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground tabular-nums"><FormattedDate date={e.date} /></td>
                  <td className="px-3 py-2">
                    <Badge variant="secondary" className="capitalize">
                      {e.type.replace(/-/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {e.connectionCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "list" && filtered.length > 0 && (
        <div>
          {grouped
            ? years.map((year) => (
                <div key={year} id={`year-${year}`}>
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-1 py-1 text-xs font-semibold text-muted-foreground mb-1">
                    {year}
                  </div>
                  <ul className="mb-4 space-y-1">
                    {grouped[year].map((e) => (
                      <EventCard key={e.slug} event={e} />
                    ))}
                  </ul>
                </div>
              ))
            : (
              <ul className="space-y-1">
                {filtered.map((e) => (
                  <EventCard key={e.slug} event={e} />
                ))}
              </ul>
            )}
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}

function EventCard({ event: e }: { event: EventItem }) {
  return (
    <li>
      <a
        href={`/events/${e.slug}`}
        className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-all hover:border-border hover:bg-muted/30 hover:shadow-sm"
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-medium group-hover:underline">{e.name}</span>
          <span className="text-sm text-muted-foreground">
            <FormattedDate date={e.date} /> · <span className="capitalize">{e.type.replace(/-/g, " ")}</span>
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {e.connectionCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>
                  {e.connectionCount}
                </span>
              </TooltipTrigger>
              <TooltipContent>{e.connectionCount} connections</TooltipContent>
            </Tooltip>
          )}
        </div>
      </a>
    </li>
  )
}
