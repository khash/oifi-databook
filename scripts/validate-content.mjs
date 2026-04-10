#!/usr/bin/env node

/**
 * Validates all JSON content files in /content/.
 * Checks: required fields, enum values, cross-reference integrity.
 * Run: node scripts/validate-content.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.resolve(__dirname, "..", "content");

const FACTIONS = [
  "opposition", "pragmatist", "reformist", "conservative", "hardliner",
  "military-irgc", "technocrat", "clerical",
];
const ORG_TYPES = [
  "political-party", "state-institution", "military", "media",
  "business", "ngo", "religious",
];
const EVENT_TYPES = [
  "election", "appointment", "purge", "protest", "leak",
  "sanctions", "indictment", "policy", "death",
];
const CONFIDENCE = ["confirmed", "alleged", "disputed", "denied"];
const FAMILY_SUBTYPES = ["spouse", "sibling", "parent", "child", "in-law"];
const RELATIONSHIP_TYPES = [
  "reports-to", "appointed-by", "oversees",
  "member-of", "founded", "led", "headed", "served-in", "spokesperson-for",
  "subsidiary-of", "affiliated-with", "funded-by",
  "aligned-with", "opposed", "endorsed", "appointed",
  "organized", "participated-in", "coordinated-with", "directed", "recruited",
  "named-in", "published", "testified-in", "subject-of",
  "family-of", "mentor-of",
];
const SYMMETRIC = ["aligned-with", "family-of"];

let errors = 0;

function err(file, msg) {
  console.error(`  ERROR [${file}]: ${msg}`);
  errors++;
}

function loadDir(subdir) {
  const dir = path.join(CONTENT, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf-8");
      try {
        return { file: `${subdir}/${f}`, data: JSON.parse(raw) };
      } catch {
        err(`${subdir}/${f}`, "Invalid JSON");
        return null;
      }
    })
    .filter(Boolean);
}

function requireField(file, obj, field) {
  if (obj[field] === undefined || obj[field] === null || obj[field] === "") {
    err(file, `Missing required field: ${field}`);
    return false;
  }
  return true;
}

function requireEnum(file, obj, field, allowed) {
  if (obj[field] != null && !allowed.includes(obj[field])) {
    err(file, `Invalid ${field}: "${obj[field]}". Allowed: ${allowed.join(", ")}`);
  }
}

// Load all entities
const people = loadDir("people");
const orgs = loadDir("orgs");
const events = loadDir("events");
const connections = loadDir("connections");

const allIds = new Set();
for (const col of [people, orgs, events]) {
  for (const { file, data } of col) {
    if (data.entity_id) {
      if (allIds.has(data.entity_id)) err(file, `Duplicate ID: ${data.entity_id}`);
      allIds.add(data.entity_id);
    }
  }
}

// Validate people
for (const { file, data } of people) {
  for (const f of ["entity_id", "slug", "name_en", "name_fa", "role", "faction", "bio"]) {
    requireField(file, data, f);
  }
  requireEnum(file, data, "faction", FACTIONS);
}

// Validate orgs
for (const { file, data } of orgs) {
  for (const f of ["entity_id", "slug", "name_en", "name_fa", "type", "description"]) {
    requireField(file, data, f);
  }
  requireEnum(file, data, "type", ORG_TYPES);
  if (data.faction) requireEnum(file, data, "faction", FACTIONS);
  if (data.parent_org && !allIds.has(data.parent_org)) {
    err(file, `parent_org "${data.parent_org}" not found`);
  }
}

// Validate events
for (const { file, data } of events) {
  for (const f of ["entity_id", "slug", "name", "date", "type", "description"]) {
    requireField(file, data, f);
  }
  requireEnum(file, data, "type", EVENT_TYPES);
  if (!data.sources?.length) err(file, "At least one source required");
}

// Validate connections
for (const { file, data } of connections) {
  for (const f of ["entity_id", "from_entity", "to_entity", "type", "confidence"]) {
    requireField(file, data, f);
  }
  requireEnum(file, data, "type", RELATIONSHIP_TYPES);
  requireEnum(file, data, "confidence", CONFIDENCE);

  if (data.from_entity && !allIds.has(data.from_entity)) {
    err(file, `from_entity "${data.from_entity}" not found`);
  }
  if (data.to_entity && !allIds.has(data.to_entity)) {
    err(file, `to_entity "${data.to_entity}" not found`);
  }
  if (SYMMETRIC.includes(data.type) && data.symmetric !== true) {
    err(file, `Type "${data.type}" must have symmetric: true`);
  }
  if (data.type === "family-of" && !FAMILY_SUBTYPES.includes(data.family_subtype)) {
    err(file, `family-of requires valid family_subtype`);
  }
  if (data.type !== "family-of" && data.family_subtype != null) {
    err(file, `family_subtype should only be set when type is "family-of"`);
  }
  if (data.confidence === "confirmed" && (!data.evidence || data.evidence.length === 0)) {
    err(file, "Confirmed connections require at least one evidence item");
  }
  for (const inter of data.intermediaries ?? []) {
    if (!allIds.has(inter)) err(file, `Intermediary "${inter}" not found`);
  }
}

// Summary
const total = people.length + orgs.length + events.length + connections.length;
console.log(`\nValidated ${total} files (${people.length} people, ${orgs.length} orgs, ${events.length} events, ${connections.length} connections)`);

if (errors > 0) {
  console.error(`\n${errors} error(s) found.`);
  process.exit(1);
} else {
  console.log("All content valid.");
}
