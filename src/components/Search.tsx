import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"

interface PagefindResult {
  id: string
  url: string
  excerpt: string
  meta: {
    title?: string
    type?: string
    faction?: string
    role?: string
  }
}

interface PagefindResponse {
  results: { id: string; data: () => Promise<PagefindResult> }[]
}

type Pagefind = {
  init: () => Promise<void>
  search: (query: string) => Promise<PagefindResponse>
}

const typeColors: Record<string, string> = {
  person: "bg-blue-100 text-blue-800",
  org: "bg-emerald-100 text-emerald-800",
  event: "bg-amber-100 text-amber-800",
}

export function Search({ centered = false, onSelect }: { centered?: boolean; onSelect?: (url: string) => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PagefindResult[]>([])
  const [loading, setLoading] = useState(false)
  const pagefindRef = useRef<Pagefind | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    // Pagefind is loaded via an inline script in the layout to avoid Vite
    // intercepting the import. Poll briefly for it to become available.
    let attempts = 0
    const interval = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).__pagefind) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pagefindRef.current = (window as any).__pagefind
        clearInterval(interval)
      } else if (++attempts > 20) {
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const doSearch = useCallback(async (q: string) => {
    if (!pagefindRef.current || !q.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const response = await pagefindRef.current.search(q)
    const data = await Promise.all(response.results.slice(0, 20).map((r) => r.data()))
    setResults(data)
    setLoading(false)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 150)
  }

  return (
    <div className={centered ? "flex min-h-[60vh] flex-col items-center justify-center px-4" : "w-full"}>
      <div className={centered ? "w-full max-w-lg" : "w-full"}>
        {centered && (
          <h1 className="mb-2 text-center text-2xl font-bold">OIFI Databook</h1>
        )}
        {centered && (
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Iranian political actors, organizations and events
          </p>
        )}
        <Input
          type="search"
          placeholder="Search for a person, organization, or event…"
          value={query}
          onChange={handleChange}
          className="h-11 text-sm"
        />
      </div>

      {query.trim() && (
        <div className={centered ? "mt-4 w-full max-w-lg" : "mt-4 w-full"}>
          {loading && <p className="text-sm text-muted-foreground">Searching…</p>}
          {!loading && results.length === 0 && (
            <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
          )}
          {!loading && results.length > 0 && (
            <ul className="space-y-2">
              {results.map((r) => (
                <li key={r.id}>
                  <a
                    href={r.url}
                    onClick={onSelect ? (e) => { e.preventDefault(); onSelect(r.url) } : undefined}
                    className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium group-hover:underline">
                          {r.meta.title}
                        </span>
                        {r.meta.type && (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[r.meta.type] ?? "bg-gray-100 text-gray-800"}`}>
                            {r.meta.type}
                          </span>
                        )}
                      </div>
                      {r.meta.role && (
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">{r.meta.role}</p>
                      )}
                      {r.meta.faction && (
                        <span className="text-xs text-muted-foreground">{r.meta.faction.replace(/-/g, " ")}</span>
                      )}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
