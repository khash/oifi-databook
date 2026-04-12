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

  // Generate entity summaries for hover cards
  function stripMd(text) {
    if (!text) return ""
    return text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_~`#>]+/g, "")
      .replace(/\n+/g, " ")
      .trim()
  }

  const summaries = {}
  for (const p of people) {
    summaries[p.entity_id] = {
      type: "person",
      slug: p.slug,
      name_en: p.name_en,
      name_fa: p.name_fa ?? null,
      has_native_fa_name: p.has_native_fa_name ?? false,
      role: p.role ?? null,
      faction: p.faction ?? null,
      irgc_member: p.irgc_member ?? false,
      excerpt: stripMd(p.bio).slice(0, 160) || null,
    }
  }
  for (const o of orgs) {
    summaries[o.entity_id] = {
      type: "org",
      slug: o.slug,
      name_en: o.name_en,
      name_fa: o.name_fa ?? null,
      has_native_fa_name: o.has_native_fa_name ?? false,
      org_type: o.type ?? null,
      faction: o.faction ?? null,
      excerpt: stripMd(o.description).slice(0, 160) || null,
    }
  }
  for (const e of events) {
    summaries[e.entity_id] = {
      type: "event",
      slug: e.slug,
      name_en: e.name,
      event_type: e.type ?? null,
      date: e.date ?? null,
      excerpt: stripMd(e.description).slice(0, 160) || null,
    }
  }

  const summariesPath = path.resolve(process.cwd(), "public", "entity-summaries.json")
  fs.writeFileSync(summariesPath, JSON.stringify(summaries))
}
