/**
 * Build-time script that generates public/graph-data.json from content/ JSON files.
 * Called by the Astro integration in astro.config.mjs.
 *
 * Self-contained (no imports from src/lib/) because Astro's integration hook
 * runs in a Node context that cannot resolve TS path aliases.
 */

import fs from "node:fs"
import path from "node:path"

interface GraphNode {
  id: string
  label: string
  type: "person" | "org" | "event"
  slug: string
  faction?: string
  role?: string
  orgType?: string
  eventType?: string
  date?: string
  data: Record<string, unknown>
}

interface GraphEdge {
  id: string
  source: string
  target: string
  type: string
  confidence: string
  symmetric: boolean
  date_from: string | null
  date_to: string | null
}

function loadJson(dir: string): Record<string, unknown>[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { editorial_notes: _, ...rest } = raw
      return rest
    })
}

export function generateGraphData() {
  const contentDir = path.resolve(process.cwd(), "content")
  const people = loadJson(path.join(contentDir, "people"))
  const orgs = loadJson(path.join(contentDir, "orgs"))
  const events = loadJson(path.join(contentDir, "events"))
  const connections = loadJson(path.join(contentDir, "connections"))

  const nodes: GraphNode[] = [
    ...people.map((p) => ({
      id: p.id as string,
      label: p.name_en as string,
      type: "person" as const,
      slug: p.slug as string,
      faction: p.faction as string,
      role: p.role as string,
      data: p,
    })),
    ...orgs.map((o) => ({
      id: o.id as string,
      label: o.name_en as string,
      type: "org" as const,
      slug: o.slug as string,
      faction: (o.faction as string) ?? undefined,
      orgType: o.type as string,
      data: o,
    })),
    ...events.map((e) => ({
      id: e.id as string,
      label: e.name as string,
      type: "event" as const,
      slug: e.slug as string,
      eventType: e.type as string,
      date: e.date as string,
      data: { ...e, body: null },
    })),
  ]

  const edges: GraphEdge[] = connections.map((c) => ({
    id: c.id as string,
    source: c.from_entity as string,
    target: c.to_entity as string,
    type: c.type as string,
    confidence: c.confidence as string,
    symmetric: c.symmetric as boolean,
    date_from: c.date_from as string | null,
    date_to: c.date_to as string | null,
  }))

  const outPath = path.resolve(process.cwd(), "public", "graph-data.json")
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify({ nodes, edges }))
}
