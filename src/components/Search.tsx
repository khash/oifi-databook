import { useState, useEffect, useRef, useCallback } from "react"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { UserIcon, BuildingIcon, CalendarIcon, HelpCircleIcon } from "lucide-react"

interface PagefindResult {
  id: string
  url: string
  excerpt: string
  meta: {
    title?: string
    type?: string
    faction?: string
    role?: string
    name_fa?: string
  }
}

interface PagefindResponse {
  results: { id: string; data: () => Promise<PagefindResult> }[]
}

type Pagefind = {
  init: () => Promise<void>
  search: (query: string) => Promise<PagefindResponse>
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  person: UserIcon,
  org: BuildingIcon,
  event: CalendarIcon,
}

export function Search({ centered = false, onSelect }: { centered?: boolean; onSelect?: (url: string) => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PagefindResult[]>([])
  const [loading, setLoading] = useState(false)
  const pagefindRef = useRef<Pagefind | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
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

  const handleValueChange = (value: string) => {
    setQuery(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 150)
  }

  const handleSelect = (url: string) => {
    if (onSelect) {
      onSelect(url)
    } else {
      window.location.href = url
    }
  }

  return (
    <div className={centered ? "flex min-h-[60vh] flex-col items-center px-4 pt-[28vh]" : "w-full"}>
      <div className={centered ? "w-full max-w-lg" : "w-full"}>
        {centered && (
          <h1 className="mb-2 text-center text-2xl font-bold">OIFI Databook</h1>
        )}
        {centered && (
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Iranian political actors, organizations and events
          </p>
        )}
        <Command shouldFilter={false} className="rounded-lg border shadow-sm p-0! [&_[data-slot=command-input-wrapper]]:p-0 [&_[data-slot=input-group]]:border-0 [&_[data-slot=input-group]]:bg-transparent [&_[data-slot=input-group]]:shadow-none [&_[data-slot=input-group]]:h-11!">
          <CommandInput
            placeholder="Search for a person, organization, or event…"
            value={query}
            onValueChange={handleValueChange}
          />
          {query.trim() && (
            <CommandList>
              {loading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Searching…
                </div>
              )}
              {!loading && results.length === 0 && (
                <CommandEmpty>No results found for &ldquo;{query}&rdquo;</CommandEmpty>
              )}
              {!loading && results.length > 0 && (
                <CommandGroup heading="Results">
                  {results.map((r) => (
                    <CommandItem
                      key={r.id}
                      value={r.url}
                      onSelect={() => handleSelect(r.url)}
                    >
                      {(() => {
                        const Icon = typeIcons[r.meta.type ?? ""] ?? HelpCircleIcon
                        return <Icon className="size-4 shrink-0 text-muted-foreground" />
                      })()}
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">
                            {r.meta.title}
                          </span>
                          {r.meta.name_fa && (
                            <span className="shrink-0 text-sm text-muted-foreground" dir="rtl" lang="fa">{r.meta.name_fa}</span>
                          )}
                        </div>
                        {r.meta.role && (
                          <p className="mt-0.5 truncate text-sm text-muted-foreground">{r.meta.role}</p>
                        )}
                        {r.meta.faction && (
                          <span className="text-xs text-muted-foreground">{r.meta.faction.replace(/-/g, " ")}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          )}
        </Command>
      </div>
    </div>
  )
}
