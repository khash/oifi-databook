import { useEffect, useRef, useCallback } from "react"
import cytoscape from "cytoscape"
// @ts-expect-error — no type declarations for cytoscape-fcose
import fcose from "cytoscape-fcose"
import type { GraphNode, GraphEdge } from "@/lib/graph-types"

let fcoseRegistered = false
if (!fcoseRegistered) {
  cytoscape.use(fcose)
  fcoseRegistered = true
}

const NODE_COLORS: Record<string, { bg: string; border: string }> = {
  person: { bg: "#dbeafe", border: "#3b82f6" },
  org: { bg: "#d1fae5", border: "#10b981" },
  event: { bg: "#fef3c7", border: "#f59e0b" },
}

const NODE_SHAPES: Record<string, string> = {
  person: "ellipse",
  org: "round-rectangle",
  event: "diamond",
}

const CONFIDENCE_STYLES: Record<string, { style: string; opacity: number; color: string }> = {
  confirmed: { style: "solid", opacity: 1, color: "#6b7280" },
  alleged: { style: "dashed", opacity: 0.75, color: "#6b7280" },
  disputed: { style: "dashed", opacity: 0.75, color: "#f59e0b" },
  denied: { style: "dashed", opacity: 0.5, color: "#9ca3af" },
}

interface CytoscapeGraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedId: string
  onNodeClick: (id: string) => void
}

export function CytoscapeGraph({ nodes, edges, selectedId, onNodeClick }: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)
  const onNodeClickRef = useRef(onNodeClick)
  useEffect(() => {
    onNodeClickRef.current = onNodeClick
  }, [onNodeClick])

  // Build Cytoscape elements
  const buildElements = useCallback(() => {
    const cyNodes = nodes.map((n) => ({
      data: {
        id: n.id,
        label: n.label,
        entityType: n.type,
      },
    }))
    const cyEdges = edges.map((e) => ({
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.type.replace(/-/g, " "),
        confidence: e.confidence,
      },
    }))
    return [...cyNodes, ...cyEdges]
  }, [nodes, edges])

  // Init Cytoscape once
  useEffect(() => {
    if (!containerRef.current) return

    const cy = cytoscape({
      container: containerRef.current,
      elements: buildElements(),
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "text-valign": "bottom",
            "text-margin-y": 4,
            "font-size": 10,
            "font-family": "var(--font-geist-sans, sans-serif)",
            width: 32,
            height: 32,
            "background-color": (ele: cytoscape.NodeSingular) =>
              NODE_COLORS[ele.data("entityType")]?.bg ?? "#e5e7eb",
            "border-width": 2,
            "border-color": (ele: cytoscape.NodeSingular) =>
              NODE_COLORS[ele.data("entityType")]?.border ?? "#6b7280",
            shape: (ele: cytoscape.NodeSingular) =>
              NODE_SHAPES[ele.data("entityType")] ?? "ellipse",
          } as cytoscape.Css.Node,
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 4,
            "border-style": "dashed",
            "overlay-opacity": 0,
          } as cytoscape.Css.Node,
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "curve-style": "bezier",
            "target-arrow-shape": "triangle",
            "target-arrow-color": (ele: cytoscape.EdgeSingular) =>
              CONFIDENCE_STYLES[ele.data("confidence")]?.color ?? "#6b7280",
            "line-color": (ele: cytoscape.EdgeSingular) =>
              CONFIDENCE_STYLES[ele.data("confidence")]?.color ?? "#6b7280",
            "line-style": (ele: cytoscape.EdgeSingular) =>
              CONFIDENCE_STYLES[ele.data("confidence")]?.style ?? "solid",
            "line-opacity": (ele: cytoscape.EdgeSingular) =>
              CONFIDENCE_STYLES[ele.data("confidence")]?.opacity ?? 1,
            label: "",
            "font-size": 9,
            "text-background-color": "white",
            "text-background-opacity": 0.9,
            "text-background-padding": "2px",
          } as cytoscape.Css.Edge,
        },
        {
          selector: "edge[?showLabel]",
          style: {
            label: "data(label)",
          } as cytoscape.Css.Edge,
        },
      ] as unknown as cytoscape.StylesheetCSS[],
      layout: { name: "fcose", animate: false } as cytoscape.LayoutOptions,
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    })

    cy.on("tap", "node", (evt) => {
      onNodeClickRef.current(evt.target.id())
    })

    cyRef.current = cy

    return () => {
      cy.destroy()
      cyRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update elements when nodes/edges change (depth toggle)
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    const nodeIds = new Set(nodes.map((n) => n.id))
    const edgeIds = new Set(edges.map((e) => e.id))

    // Show/hide nodes
    cy.nodes().forEach((n) => {
      n.style("display", nodeIds.has(n.id()) ? "element" : "none")
    })
    cy.edges().forEach((e) => {
      e.style("display", edgeIds.has(e.id()) ? "element" : "none")
    })

    // Add any new nodes/edges not yet in the graph
    const existingNodeIds = new Set<string>()
    cy.nodes().forEach((n) => { existingNodeIds.add(n.id()) })
    const existingEdgeIds = new Set<string>()
    cy.edges().forEach((e) => { existingEdgeIds.add(e.id()) })

    const newNodes = nodes
      .filter((n) => !existingNodeIds.has(n.id))
      .map((n) => ({
        data: { id: n.id, label: n.label, entityType: n.type },
      }))
    const newEdges = edges
      .filter((e) => !existingEdgeIds.has(e.id))
      .map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.type.replace(/-/g, " "),
          confidence: e.confidence,
        },
      }))

    if (newNodes.length || newEdges.length) {
      cy.add([...newNodes, ...newEdges])
    }

    // Re-run layout on visible elements
    const visible = cy.elements().filter((ele) => ele.style("display") !== "none")
    visible
      .layout({ name: "fcose", animate: true, animationDuration: 300 } as cytoscape.LayoutOptions)
      .run()
  }, [nodes, edges])

  // Update selection and edge labels
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    // Select node
    cy.nodes().unselect()
    const node = cy.getElementById(selectedId)
    if (node.length) {
      node.select()

      // Show labels only on edges connected to selected node
      cy.edges().data("showLabel", false)
      node.connectedEdges().filter((e) => e.style("display") !== "none").data("showLabel", true)

      // Animate to center on the selected node
      cy.animate({
        center: { eles: node },
        duration: 300,
        easing: "ease-in-out-cubic" as cytoscape.Css.TransitionTimingFunction,
      })
    }
  }, [selectedId, nodes])

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-[300px]"
    />
  )
}
