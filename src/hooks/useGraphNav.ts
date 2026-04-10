import { useState, useEffect, useCallback } from "react"
import type { GraphData } from "@/lib/graph-types"

function urlForEntity(data: GraphData, entityId: string): string {
  const node = data.nodes.find((n) => n.id === entityId)
  if (!node) return "/"
  if (node.type === "person") return `/people/${node.slug}`
  if (node.type === "org") return `/orgs/${node.slug}`
  return `/events/${node.slug}`
}

export function useGraphNav(
  initialEntityId: string,
  data: GraphData | null,
) {
  const [selectedId, setSelectedId] = useState(initialEntityId)
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([initialEntityId])
  const [depth, setDepth] = useState<1 | 2 | 3>(1)

  const selectEntity = useCallback(
    (id: string, pushToHistory = true) => {
      setSelectedId(id)
      setBreadcrumbs((prev) => {
        const idx = prev.indexOf(id)
        if (idx >= 0) return prev.slice(0, idx + 1)
        return [...prev, id]
      })
      if (pushToHistory && data) {
        window.location.href = urlForEntity(data, id)
      }
    },
    [data],
  )

  const resetBreadcrumbs = useCallback((id: string) => {
    setSelectedId(id)
    setBreadcrumbs([id])
  }, [])

  useEffect(() => {
    function onPopstate(e: PopStateEvent) {
      const entityId = e.state?.entityId
      if (entityId) {
        setSelectedId(entityId)
        setBreadcrumbs((prev) => {
          const idx = prev.indexOf(entityId)
          if (idx >= 0) return prev.slice(0, idx + 1)
          return [...prev, entityId]
        })
      }
    }
    window.addEventListener("popstate", onPopstate)
    window.history.replaceState({ entityId: initialEntityId }, "")
    return () => window.removeEventListener("popstate", onPopstate)
  }, [initialEntityId])

  return {
    selectedId,
    breadcrumbs,
    depth,
    setDepth,
    selectEntity,
    resetBreadcrumbs,
  }
}
