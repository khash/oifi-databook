import { randomUUID } from "node:crypto";

type EntityPrefix = "person" | "org" | "event" | "conn";

/** Generate a prefixed ID for seed scripts. Not called at build time. */
export function generateId(prefix: EntityPrefix): string {
  return `${prefix}-${randomUUID().replace(/-/g, "").slice(0, 9)}`;
}
