/**
 * Build-time script that scans markdown fields for internal links
 * and warns when no matching connection file exists.
 *
 * Plain .mjs (no TypeScript) so it runs in Node without a TS loader,
 * which is required for Cloudflare Pages builds.
 */

import fs from "node:fs"
import path from "node:path"

const LINK_RE = /\[([^\]]+)\]\(\/(people|orgs|events)\/([^)]+)\)/g

function loadJson(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")))
}

export function checkUnlinkedReferences() {
  const contentDir = path.resolve(process.cwd(), "content")

  const people = loadJson(path.join(contentDir, "people"))
  const orgs = loadJson(path.join(contentDir, "orgs"))
  const events = loadJson(path.join(contentDir, "events"))
  const connections = loadJson(path.join(contentDir, "connections"))

  // Build a set of all known entity slugs by type
  const slugToId = new Map()
  for (const p of people) slugToId.set(`people/${p.slug}`, p.entity_id)
  for (const o of orgs) slugToId.set(`orgs/${o.slug}`, o.entity_id)
  for (const e of events) slugToId.set(`events/${e.slug}`, e.entity_id)

  // Build a set of connected entity pairs (both directions)
  const connectedPairs = new Set()
  for (const c of connections) {
    connectedPairs.add(`${c.from_entity}::${c.to_entity}`)
    connectedPairs.add(`${c.to_entity}::${c.from_entity}`)
  }

  // Check that every connection references existing entities
  const entityIds = new Set([
    ...people.map((p) => p.entity_id),
    ...orgs.map((o) => o.entity_id),
    ...events.map((e) => e.entity_id),
  ])

  const orphanWarnings = []
  for (const c of connections) {
    if (!entityIds.has(c.from_entity)) {
      orphanWarnings.push(
        `connection ${c.entity_id} references from_entity "${c.from_entity}" — entity not found`
      )
    }
    if (!entityIds.has(c.to_entity)) {
      orphanWarnings.push(
        `connection ${c.entity_id} references to_entity "${c.to_entity}" — entity not found`
      )
    }
  }

  if (orphanWarnings.length > 0) {
    for (const w of orphanWarnings) {
      console.warn(`[orphan-conn] ⚠ ${w}`)
    }
    console.warn(
      `[orphan-conn] ${orphanWarnings.length} orphan connection reference(s) found out of ${connections.length} connections`
    )
  } else {
    console.log(
      `[orphan-conn] ✓ All ${connections.length} connections reference existing entities`
    )
  }

  // Collect all entities with their markdown fields
  const entries = [
    ...people.map((p) => ({ id: p.entity_id, label: p.name_en, fields: { bio: p.bio } })),
    ...orgs.map((o) => ({ id: o.entity_id, label: o.name_en, fields: { description: o.description } })),
    ...events.map((e) => ({
      id: e.entity_id,
      label: e.name,
      fields: { description: e.description, body: e.body },
    })),
  ]

  const warnings = []
  let totalLinks = 0

  for (const entry of entries) {
    for (const [fieldName, text] of Object.entries(entry.fields)) {
      if (!text) continue
      for (const match of text.matchAll(LINK_RE)) {
        totalLinks++
        const [, , type, slug] = match
        const targetKey = `${type}/${slug}`
        const targetId = slugToId.get(targetKey)

        if (!targetId) {
          warnings.push(
            `${entry.id} ${fieldName} links to /${targetKey} — entity not found`
          )
          continue
        }

        if (targetId === entry.id) continue // self-link, skip

        if (!connectedPairs.has(`${entry.id}::${targetId}`)) {
          warnings.push(
            `${entry.id} ${fieldName} links to /${targetKey} but no connection exists`
          )
        }
      }
    }
  }

  // Report
  if (warnings.length > 0) {
    for (const w of warnings) {
      console.warn(`[unlinked-refs] ⚠ ${w}`)
    }
    console.warn(
      `[unlinked-refs] ${warnings.length} unlinked reference(s) found out of ${totalLinks} internal links`
    )
  } else {
    console.log(
      `[unlinked-refs] ✓ All ${totalLinks} internal links have matching connections`
    )
  }

  const allWarnings = [...orphanWarnings, ...warnings]
  if (allWarnings.length > 0 && process.env.STRICT_LINKS === "1") {
    throw new Error(
      `Build failed: ${allWarnings.length} integrity issue(s). Set STRICT_LINKS=0 to allow.`
    )
  }

  return allWarnings
}
