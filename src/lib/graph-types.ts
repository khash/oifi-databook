import type { Person, Org, Event, ConfidenceLevel, RelationshipType } from "./types"

export interface GraphNode {
  id: string
  label: string
  type: "person" | "org" | "event"
  slug: string
  faction?: string
  role?: string
  orgType?: string
  eventType?: string
  date?: string
  data: Person | Org | Event
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type: RelationshipType
  confidence: ConfidenceLevel
  symmetric: boolean
  date_from: string | null
  date_to: string | null
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
