import type { GraphData, GraphNode, GraphEdge } from "./graph-types"

/**
 * BFS from `rootId` up to `depth` hops. Returns the subgraph of visible nodes and edges.
 * Depth 3 returns the full graph.
 */
export function getSubgraph(
  data: GraphData,
  rootId: string,
  depth: 1 | 2 | 3,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (depth === 3) return data

  const visited = new Set<string>([rootId])
  let frontier = [rootId]

  // Build adjacency from edges (undirected for BFS discovery)
  const adj = new Map<string, string[]>()
  for (const e of data.edges) {
    if (!adj.has(e.source)) adj.set(e.source, [])
    if (!adj.has(e.target)) adj.set(e.target, [])
    adj.get(e.source)!.push(e.target)
    adj.get(e.target)!.push(e.source)
  }

  for (let d = 0; d < depth; d++) {
    const next: string[] = []
    for (const nodeId of frontier) {
      for (const neighbor of adj.get(nodeId) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          next.push(neighbor)
        }
      }
    }
    frontier = next
  }

  const nodes = data.nodes.filter((n) => visited.has(n.id))
  const edges = data.edges.filter(
    (e) => visited.has(e.source) && visited.has(e.target),
  )

  return { nodes, edges }
}
