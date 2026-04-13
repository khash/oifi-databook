import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
import { OrgTypeBadge, ORG_TYPE_CONFIG } from "@/components/OrgTypeBadge"
import { ORG_TYPES } from "@/lib/constants"
import type { Faction, OrgType } from "@/lib/types"

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

interface OrgItem {
  slug: string
  name_en: string
  name_fa: string | null
  type: OrgType
  faction: Faction
  connectionCount: number
}

type SortKey = "name" | "type" | "connections"
export function OrgsIndex({ orgs }: { orgs: OrgItem[] }) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sort, setSort] = useState<SortKey>("name")
  const [page, setPage] = useState(1)

  useEffect(() => { setPage(1) }, [search, typeFilter, sort])

  const filtered = useMemo(() => {
    let result = orgs

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (o) =>
          o.name_en.toLowerCase().includes(q) ||
          o.name_fa?.includes(search),
      )
    }

    if (typeFilter !== "all") {
      result = result.filter((o) => o.type === typeFilter)
    }

    result = [...result].sort((a, b) => {
      if (sort === "name") return a.name_en.localeCompare(b.name_en)
      if (sort === "type") {
        return a.type.localeCompare(b.type) || a.name_en.localeCompare(b.name_en)
      }
      return b.connectionCount - a.connectionCount || a.name_en.localeCompare(b.name_en)
    })

    return result
  }, [orgs, search, typeFilter, sort])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pageNumbers = getPageNumbers(page, totalPages)

  // Letter groups (from current page only)
  const grouped = useMemo(() => {
    if (sort !== "name") return null
    const groups: Record<string, OrgItem[]> = {}
    for (const o of paginated) {
      const letter = o.name_en[0].toUpperCase()
      ;(groups[letter] ??= []).push(o)
    }
    return groups
  }, [paginated, sort])

  const letters = grouped ? Object.keys(grouped).sort() : []

  return (
    <TooltipProvider>
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold">Organisations</h1>
          <span className="text-sm text-muted-foreground">
            {filtered.length} of {orgs.length}
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
              {ORG_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
{ORG_TYPE_CONFIG[t].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">A–Z</SelectItem>
              <SelectItem value="type">By type</SelectItem>
              <SelectItem value="connections">By connections</SelectItem>
            </SelectContent>
          </Select>

        </div>

        {grouped && letters.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {letters.map((l) => (
              <a
                key={l}
                href={`#letter-${l}`}
                className="flex size-7 items-center justify-center rounded-md text-xs font-medium hover:bg-accent transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No organisations match your filters.</p>
      )}

      {filtered.length > 0 && (
        <div>
          {grouped
            ? letters.map((letter) => (
                <div key={letter} id={`letter-${letter}`}>
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-1 py-1 text-xs font-semibold text-muted-foreground mb-1">
                    {letter}
                  </div>
                  <ul className="mb-4 space-y-1">
                    {grouped[letter].map((o) => (
                      <OrgCard key={o.slug} org={o} />
                    ))}
                  </ul>
                </div>
              ))
            : (
              <ul className="space-y-1">
                {paginated.map((o) => (
                  <OrgCard key={o.slug} org={o} />
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

function OrgCard({ org: o }: { org: OrgItem }) {
  return (
    <li>
      <a
        href={`/orgs/${o.slug}`}
        className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-all hover:border-border hover:bg-muted/30 hover:shadow-sm"
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium group-hover:underline">{o.name_en}</span>
            <OrgTypeBadge type={o.type} />
          </div>
          {o.name_fa && (
            <div className="text-xs text-muted-foreground" dir="rtl" lang="fa">
              {o.name_fa}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {o.connectionCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>
                  {o.connectionCount}
                </span>
              </TooltipTrigger>
              <TooltipContent>{o.connectionCount} connections</TooltipContent>
            </Tooltip>
          )}
        </div>
      </a>
    </li>
  )
}
