import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrgTypeBadge, ORG_TYPE_CONFIG } from "@/components/OrgTypeBadge"
import { ORG_TYPES } from "@/lib/constants"
import type { Faction, OrgType } from "@/lib/types"

interface OrgItem {
  slug: string
  name_en: string
  name_fa: string
  type: OrgType
  faction: Faction | null
  connectionCount: number
}

type SortKey = "name" | "type" | "connections"
export function OrgsIndex({ orgs }: { orgs: OrgItem[] }) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sort, setSort] = useState<SortKey>("name")
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

  // Letter groups
  const grouped = useMemo(() => {
    if (sort !== "name") return null
    const groups: Record<string, OrgItem[]> = {}
    for (const o of filtered) {
      const letter = o.name_en[0].toUpperCase()
      ;(groups[letter] ??= []).push(o)
    }
    return groups
  }, [filtered, sort])

  const letters = grouped ? Object.keys(grouped).sort() : []

  return (
    <TooltipProvider>
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold">Organisations</h1>
          <span className="text-sm text-muted-foreground">
            {filtered.length} of {orgs.length}
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
              {ORG_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
{ORG_TYPE_CONFIG[t].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger>
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
                {filtered.map((o) => (
                  <OrgCard key={o.slug} org={o} />
                ))}
              </ul>
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
