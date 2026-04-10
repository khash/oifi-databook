import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { FactionSpectrum } from "@/components/FactionSpectrum"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SPECTRUM_FACTIONS, INSTITUTIONAL_FACTIONS } from "@/lib/constants"
import type { Faction } from "@/lib/types"

interface PersonItem {
  slug: string
  name_en: string
  name_fa: string
  role: string
  faction: Faction
  irgc_member: boolean
  connectionCount: number
}

type SortKey = "name" | "faction" | "connections"
type ViewMode = "list" | "table"

const ALL_FACTIONS = [...SPECTRUM_FACTIONS, ...INSTITUTIONAL_FACTIONS] as const

export function PeopleIndex({ people }: { people: PersonItem[] }) {
  const [search, setSearch] = useState("")
  const [factionFilter, setFactionFilter] = useState<string>("all")
  const [irgcOnly, setIrgcOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>("name")
  const [view, setView] = useState<ViewMode>("list")

  const filtered = useMemo(() => {
    let result = people

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name_en.toLowerCase().includes(q) ||
          p.name_fa.includes(search) ||
          p.role.toLowerCase().includes(q),
      )
    }

    if (factionFilter !== "all") {
      result = result.filter((p) => p.faction === factionFilter)
    }

    if (irgcOnly) {
      result = result.filter((p) => p.irgc_member)
    }

    result = [...result].sort((a, b) => {
      if (sort === "name") return a.name_en.localeCompare(b.name_en)
      if (sort === "faction") {
        const ai = ALL_FACTIONS.indexOf(a.faction)
        const bi = ALL_FACTIONS.indexOf(b.faction)
        return ai - bi || a.name_en.localeCompare(b.name_en)
      }
      return b.connectionCount - a.connectionCount || a.name_en.localeCompare(b.name_en)
    })

    return result
  }, [people, search, factionFilter, irgcOnly, sort])

  // Letter groups for list view
  const grouped = useMemo(() => {
    if (sort !== "name") return null
    const groups: Record<string, PersonItem[]> = {}
    for (const p of filtered) {
      const letter = p.name_en[0].toUpperCase()
      ;(groups[letter] ??= []).push(p)
    }
    return groups
  }, [filtered, sort])

  const letters = grouped ? Object.keys(grouped).sort() : []

  return (
    <TooltipProvider>
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold">People</h1>
          <span className="text-sm text-muted-foreground">
            {filtered.length} of {people.length}
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Filter by name or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48"
          />

          <Select value={factionFilter} onValueChange={setFactionFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All factions</SelectItem>
              {ALL_FACTIONS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f.replace(/-/g, " ")}
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
              <SelectItem value="faction">By faction</SelectItem>
              <SelectItem value="connections">By connections</SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={() => setIrgcOnly(!irgcOnly)}
            className={`inline-flex h-8 items-center rounded-lg border px-2.5 text-sm transition-colors ${irgcOnly ? "border-green-800 bg-green-800 text-white" : "border-input hover:bg-accent"}`}
          >
            IRGC
          </button>

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

        {/* Letter jump bar */}
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
        <p className="text-center text-muted-foreground py-8">No people match your filters.</p>
      )}

      {/* Table view */}
      {view === "table" && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-left font-medium">Role</th>
                <th className="px-3 py-2 text-left font-medium">Faction</th>
                <th className="px-3 py-2 text-right font-medium">Links</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.slug} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2">
                    <a href={`/people/${p.slug}`} className="hover:underline font-medium">
                      {p.name_en}
                    </a>
                    {p.name_fa && (
                      <span className="ml-2 text-xs text-muted-foreground" dir="rtl" lang="fa">
                        {p.name_fa}
                      </span>
                    )}
                    {p.irgc_member && (
                      <Badge className="ml-2 bg-green-800 text-white hover:bg-green-900">IRGC</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{p.role}</td>
                  <td className="px-3 py-2">
                    <FactionSpectrum faction={p.faction} />
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {p.connectionCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* List view */}
      {view === "list" && filtered.length > 0 && (
        <div>
          {grouped
            ? letters.map((letter) => (
                <div key={letter} id={`letter-${letter}`}>
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-1 py-1 text-xs font-semibold text-muted-foreground mb-1">
                    {letter}
                  </div>
                  <ul className="mb-4 space-y-1">
                    {grouped[letter].map((p) => (
                      <PersonCard key={p.slug} person={p} />
                    ))}
                  </ul>
                </div>
              ))
            : (
              <ul className="space-y-1">
                {filtered.map((p) => (
                  <PersonCard key={p.slug} person={p} />
                ))}
              </ul>
            )}
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}

function PersonCard({ person: p }: { person: PersonItem }) {
  return (
    <li>
      <a
        href={`/people/${p.slug}`}
        className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-all hover:border-border hover:bg-muted/30 hover:shadow-sm"
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium group-hover:underline">{p.name_en}</span>
            {p.name_fa && (
              <span className="text-xs text-muted-foreground" dir="rtl" lang="fa">
                {p.name_fa}
              </span>
            )}
            {p.irgc_member && (
              <Badge className="bg-green-800 text-white hover:bg-green-900">IRGC</Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground">{p.role}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {p.connectionCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>
                  {p.connectionCount}
                </span>
              </TooltipTrigger>
              <TooltipContent>{p.connectionCount} connections</TooltipContent>
            </Tooltip>
          )}
          <FactionSpectrum faction={p.faction} />
        </div>
      </a>
    </li>
  )
}
