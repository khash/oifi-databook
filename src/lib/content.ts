/**
 * Content access layer — the ONLY path through which JSON data reaches page code.
 *
 * All functions strip `editorial_notes` before returning. Never import JSON
 * files from /content/ directly in pages or components.
 */

import fs from "node:fs";
import path from "node:path";
import type { Person, Org, Event, Connection } from "./types";

const CONTENT_DIR = path.resolve(process.cwd(), "content");

function stripEditorial<T>(obj: T & { editorial_notes?: unknown }): T {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { editorial_notes: _, ...rest } = obj;
  return rest as T;
}

function loadCollection<T>(
  subdir: string,
): T[] {
  const dir = path.join(CONTENT_DIR, subdir);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
      return stripEditorial<T>(raw);
    });
}

export function getPeople(): Person[] {
  return loadCollection<Person>("people");
}

export function getOrgs(): Org[] {
  return loadCollection<Org>("orgs");
}

export function getEvents(): Event[] {
  return loadCollection<Event>("events");
}

export function getConnections(): Connection[] {
  return loadCollection<Connection>("connections");
}

export function getPersonById(id: string): Person | undefined {
  return getPeople().find((p) => p.entity_id === id);
}

export function getOrgById(id: string): Org | undefined {
  return getOrgs().find((o) => o.entity_id === id);
}

export function getEventById(id: string): Event | undefined {
  return getEvents().find((e) => e.entity_id === id);
}

export function getEntityById(
  id: string,
): Person | Org | Event | undefined {
  return getPersonById(id) ?? getOrgById(id) ?? getEventById(id);
}

export function getEntityTypeById(
  id: string,
): "person" | "org" | "event" | undefined {
  if (getPersonById(id)) return "person";
  if (getOrgById(id)) return "org";
  if (getEventById(id)) return "event";
  return undefined;
}

/** Returns all connections where the entity appears as from_entity or to_entity. */
export function getConnectionsForEntity(entityId: string): Connection[] {
  return getConnections().filter(
    (c) => c.from_entity === entityId || c.to_entity === entityId,
  );
}
