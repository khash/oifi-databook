import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FormattedDate } from "@/components/FormattedDate"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { EventTypeBadge, EVENT_TYPE_CONFIG } from "@/components/EventTypeBadge"
import type { EventType } from "@/lib/types"

const PAGE_SIZE = 50

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "...")[] = []
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n) }
  add(1)
  if (current > 3) pages.push("...")
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) add(i)
  if (current < total - 2) pages.push("...")
  add(total)
  return pages
}

interface EventItem {
  slug: string
  name: string
  date: string
  type: EventType
  connectionCount: number
}

type SortKey = "date-desc" | "date-asc" | "name" | "connections"

export function EventsIndex({ events }: { events: EventItem[] }) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sort, setSort] = useState<SortKey>("date-desc")
  const [page, setPage] = useState(1)

  useEffect(() => { setPage(1) }, [search, typeFilter, sort])

  const usedTypes = useMemo(() => {
    const types = new Set(events.map((e) => e.type))
    return Object.keys(EVENT_TYPE_CONFIG).filter((t) => types.has(t as EventType)) as EventType[]
  }, [events])

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

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pageNumbers = getPageNumbers(page, totalPages)

  // Group by year when sorted by date (from current page only)
  const grouped = useMemo(() => {
    if (sort !== "date-desc" && sort !== "date-asc") return null
    const groups: Record<string, EventItem[]> = {}
    for (const e of paginated) {
      const year = e.date.slice(0, 4)
      ;(groups[year] ??= []).push(e)
    }
    return groups
  }, [paginated, sort])

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
            {totalPages > 1 && ` · page ${page} of ${totalPages}`}
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
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {usedTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {EVENT_TYPE_CONFIG[t].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="name">A–Z</SelectItem>
              <SelectItem value="connections">By connections</SelectItem>
            </SelectContent>
          </Select>

          {grouped && years.length > 1 && (
            <Select
              value=""
              onValueChange={(y) => document.getElementById(`year-${y}`)?.scrollIntoView({ behavior: "smooth" })}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Jump to year…" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 space-y-2">
          <p className="text-muted-foreground">No events match your filters.</p>
          {search && (
            <a href={`/suggest?q=${encodeURIComponent(search)}`} className="text-sm text-primary hover:underline">
              Suggest &ldquo;{search}&rdquo; as a new entity &rarr;
            </a>
          )}
        </div>
      )}

      {filtered.length > 0 && (
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
                {paginated.map((e) => (
                  <EventCard key={e.slug} event={e} />
                ))}
              </ul>
            )}

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }}
                    aria-disabled={page === 1}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {pageNumbers.map((n, i) =>
                  n === "..." ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={n}>
                      <PaginationLink
                        href="#"
                        isActive={page === n}
                        onClick={(e) => { e.preventDefault(); setPage(n) }}
                      >
                        {n}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)) }}
                    aria-disabled={page === totalPages}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
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
          <div className="flex items-center gap-2">
            <span className="font-medium group-hover:underline">{e.name}</span>
            <EventTypeBadge type={e.type} />
          </div>
          <span className="text-xs text-muted-foreground">
            <FormattedDate date={e.date} />
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
