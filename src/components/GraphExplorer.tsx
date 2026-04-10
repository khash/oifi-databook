import { useEffect, useMemo } from "react"
import { useGraphData } from "@/hooks/useGraphData"
import { useGraphNav } from "@/hooks/useGraphNav"
import { getSubgraph } from "@/lib/graph-bfs"
import { FlowGraph } from "./FlowGraph"
import { DepthToggle } from "./DepthToggle"
import { Card } from "@/components/ui/card"

interface GraphExplorerProps {
  initialEntityId: string
}

export function GraphExplorer({ initialEntityId }: GraphExplorerProps) {
  const { data, loading, error } = useGraphData()
  const { selectedId, depth, setDepth, selectEntity, resetBreadcrumbs } = useGraphNav(
    initialEntityId,
    data,
  )

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
    <Card className="flex h-full flex-col overflow-hidden bg-muted/50">
      <div className="absolute top-2 right-2 z-10">
        <DepthToggle depth={depth} onChange={setDepth} />
      </div>
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <FlowGraph
          nodes={subgraph.nodes}
          edges={subgraph.edges}
          selectedId={selectedId}
          onNodeClick={selectEntity}
        />
      </div>
    </Card>
  )
}
