/**
 * Build-time script that generates public/graph-data.json from content/ JSON files.
 * Called by the Astro integration in astro.config.mjs.
 *
 * Plain .mjs (no TypeScript) so it runs in Node without a TS loader,
 * which is required for Cloudflare Pages builds.
 */

import fs from "node:fs"
import path from "node:path"

function loadJson(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"))
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

  const nodes = [
    ...people.map((p) => ({
      id: p.entity_id,
      label: p.name_en,
      type: "person",
      slug: p.slug,
      faction: p.faction,
      role: p.role,
      data: p,
    })),
    ...orgs.map((o) => ({
      id: o.entity_id,
      label: o.name_en,
      type: "org",
      slug: o.slug,
      faction: o.faction ?? undefined,
      orgType: o.type,
      data: o,
    })),
    ...events.map((e) => ({
      id: e.entity_id,
      label: e.name,
      type: "event",
      slug: e.slug,
      eventType: e.type,
      date: e.date,
      data: { ...e, body: null },
    })),
  ]

  const edges = connections.map((c) => ({
    id: c.entity_id,
    source: c.from_entity,
    target: c.to_entity,
    type: c.type,
    confidence: c.confidence,
    symmetric: c.symmetric,
    date_from: c.date_from,
    date_to: c.date_to,
  }))

  const outPath = path.resolve(process.cwd(), "public", "graph-data.json")
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify({ nodes, edges }))
}
