import { useMemo, useCallback } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  useReactFlow,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type ReactFlowInstance,
  Position,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import Dagre from "@dagrejs/dagre"
import type { GraphNode, GraphEdge } from "@/lib/graph-types"
import { EntityNode } from "./EntityNode"

const NODE_COLORS: Record<string, { bg: string; border: string }> = {
  person: { bg: "#dbeafe", border: "#3b82f6" },
  org: { bg: "#d1fae5", border: "#10b981" },
  event: { bg: "#fef3c7", border: "#f59e0b" },
}

const CONFIDENCE_STYLES: Record<string, { strokeDasharray?: string; opacity: number }> = {
  confirmed: { opacity: 0.6 },
  alleged: { strokeDasharray: "5 3", opacity: 0.5 },
  disputed: { strokeDasharray: "5 3", opacity: 0.4 },
  denied: { strokeDasharray: "3 3", opacity: 0.3 },
}

const nodeTypes = { entity: EntityNode }

function layoutGraph(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
  selectedId: string,
): { nodes: Node[]; edges: Edge[] } {
  const g = new Dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: "TB", ranksep: 80, nodesep: 60, edgesep: 30 })

  for (const n of graphNodes) {
    g.setNode(n.id, { width: 140, height: 50 })
  }
  for (const e of graphEdges) {
    g.setEdge(e.source, e.target)
  }

  Dagre.layout(g)

  const nodes: Node[] = graphNodes.map((n) => {
    const pos = g.node(n.id)
    const colors = NODE_COLORS[n.type] ?? { bg: "#e5e7eb", border: "#6b7280" }
    return {
      id: n.id,
      type: "entity",
      position: { x: pos.x - 70, y: pos.y - 25 },
      data: {
        label: n.label,
        entityType: n.type,
        selected: n.id === selectedId,
        bg: colors.bg,
        border: colors.border,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    }
  })

  const edges: Edge[] = graphEdges.map((e) => {
    const conf = CONFIDENCE_STYLES[e.confidence] ?? { opacity: 0.5 }
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.type.replace(/-/g, " "),
      type: "default",
      style: {
        stroke: "#9ca3af",
        strokeWidth: 1,
        opacity: conf.opacity,
        ...(conf.strokeDasharray ? { strokeDasharray: conf.strokeDasharray } : {}),
      },
      labelStyle: { fontSize: 9, fill: "#9ca3af", fontFamily: "'Geist Variable', sans-serif" },
      labelBgStyle: { fill: "white", fillOpacity: 0.8 },
      labelBgPadding: [4, 2] as [number, number],
      labelShowBg: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af", width: 12, height: 12 },
      animated: false,
    }
  })

  return { nodes, edges }
}

interface FlowGraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedId: string
  onNodeClick: (id: string) => void
}

function FlowGraphInner({ nodes: graphNodes, edges: graphEdges, selectedId, onNodeClick }: FlowGraphProps) {
  const { nodes, edges } = useMemo(
    () => layoutGraph(graphNodes, graphEdges, selectedId),
    [graphNodes, graphEdges, selectedId],
  )

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      onNodeClick(node.id)
    },
    [onNodeClick],
  )

  const selectedNode = nodes.find((n) => n.id === selectedId)

  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      if (selectedNode) {
        // Center on the selected node at a comfortable zoom
        const x = selectedNode.position.x + 70 // center of node (width/2)
        const y = selectedNode.position.y + 25 // center of node (height/2)
        instance.setCenter(x, y, { zoom: 1, duration: 0 })
      } else {
        instance.fitView({ padding: 0.3, maxZoom: 1.2, duration: 0 })
      }
    },
    [selectedNode],
  )

  return (
    <ReactFlow
      key={`${selectedId}-${graphNodes.length}`}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={handleNodeClick}
      onInit={handleInit}
      minZoom={0.2}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
    >
      <Background gap={20} size={1} color="#f1f5f9" />
    </ReactFlow>
  )
}

export function FlowGraph(props: FlowGraphProps) {
  return (
    <ReactFlowProvider>
      <FlowGraphInner {...props} />
    </ReactFlowProvider>
  )
}
