import { useEffect, useMemo, useRef, useState } from "react"
import { useGraphData } from "@/hooks/useGraphData"
import { useGraphNav } from "@/hooks/useGraphNav"
import { getSubgraph } from "@/lib/graph-bfs"
import { CytoscapeGraph } from "./CytoscapeGraph"
import { ProfilePanel } from "./ProfilePanel"
import { BreadcrumbBar } from "./BreadcrumbBar"
import { DepthToggle } from "./DepthToggle"

interface GraphExplorerProps {
  initialEntityId: string
}

export function GraphExplorer({ initialEntityId }: GraphExplorerProps) {
  const { data, loading, error } = useGraphData()
  const { selectedId, breadcrumbs, depth, setDepth, selectEntity, resetBreadcrumbs } = useGraphNav(
    initialEntityId,
    data,
  )
  const articleHidden = useRef(false)

  // Hide the static Astro article once data is loaded
  useEffect(() => {
    if (data && !articleHidden.current) {
      const article = document.querySelector("article[data-pagefind-body]")
      if (article) {
        article.classList.add("hidden")
        articleHidden.current = true
      }
    }
  }, [data])

  // Expose navigation for search integration
  useEffect(() => {
    const selectByUrl = (url: string) => {
      if (!data) return
      // Match URL like /people/slug or /orgs/slug to a node
      const node = data.nodes.find((n) => {
        if (n.type === "person") return url === `/people/${n.slug}` || url === `/people/${n.slug}/`
        if (n.type === "org") return url === `/orgs/${n.slug}` || url === `/orgs/${n.slug}/`
        if (n.type === "event") return url === `/events/${n.slug}` || url === `/events/${n.slug}/`
        return false
      })
      if (node) {
        resetBreadcrumbs(node.id)
        selectEntity(node.id)
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__graphNav = { selectEntity, resetBreadcrumbs, selectByUrl }
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__graphNav
    }
  }, [selectEntity, resetBreadcrumbs, data])

  const subgraph = useMemo(() => {
    if (!data) return { nodes: [], edges: [] }
    return getSubgraph(data, selectedId, depth)
  }, [data, selectedId, depth])

  const selectedNode = data?.nodes.find((n) => n.id === selectedId)
  const selectedEdges = data?.edges.filter(
    (e) => e.source === selectedId || e.target === selectedId,
  ) ?? []

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false,
  )
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)")
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-destructive">
        Failed to load graph data
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading graph…
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {data && (
        <BreadcrumbBar
          breadcrumbs={breadcrumbs}
          data={data}
          onNavigate={selectEntity}
        />
      )}

      <div className="flex flex-1 min-h-0">
        {/* Graph panel — hidden on mobile */}
        {!isMobile && (
          <div className="flex flex-1 flex-col min-h-0">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">Depth</span>
              <DepthToggle depth={depth} onChange={setDepth} />
            </div>
            <div className="flex-1 min-h-0">
              <CytoscapeGraph
                nodes={subgraph.nodes}
                edges={subgraph.edges}
                selectedId={selectedId}
                onNodeClick={selectEntity}
              />
            </div>
          </div>
        )}

        {/* Profile panel */}
        {selectedNode && (
          <div className={isMobile ? "w-full" : "w-[400px] border-l"}>
            <ProfilePanel
              node={selectedNode}
              edges={selectedEdges}
              data={data}
              onEntityClick={selectEntity}
            />
          </div>
        )}
      </div>
    </div>
  )
}
