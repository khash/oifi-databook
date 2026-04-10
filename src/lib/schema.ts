import { z } from "zod/v4";
import {
  FACTIONS,
  ORG_TYPES,
  EVENT_TYPES,
  CONFIDENCE_LEVELS,
  FAMILY_SUBTYPES,
  ALL_RELATIONSHIP_TYPES,
  ENTITY_TAGS,
} from "./constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toOptions(values: readonly string[]) {
  return values.map((v) => ({ value: v, label: v.replace(/-/g, " ") }));
}

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

export const evidenceItemSchema = z.object({
  source_url: z.string(),
  source_title: z.string(),
  source_date: z.string(),
  description: z.string(),
});

export const sourceSchema = z.object({
  url: z.string(),
  title: z.string(),
  date: z.string(),
  publisher: z.string(),
});

// ---------------------------------------------------------------------------
// Entity schemas
// ---------------------------------------------------------------------------

export const personSchema = z.object({
  entity_id: z.string(),
  slug: z.string(),
  name_en: z.string(),
  name_fa: z.string().nullable(),
  has_native_fa_name: z.boolean(),
  aliases: z.array(z.string()),
  born: z.number().nullable(),
  birthplace: z.string().nullable(),
  role: z.string(),
  faction: z.enum(FACTIONS).nullable(),
  bio: z.string(),
  irgc_member: z.boolean(),
  expertise: z.array(z.string()),
  tags: z.array(z.enum(ENTITY_TAGS)),
  photo: z.string().nullable(),
  editorial_notes: z.string(),
});

export const orgSchema = z.object({
  entity_id: z.string(),
  slug: z.string(),
  name_en: z.string(),
  name_fa: z.string().nullable(),
  has_native_fa_name: z.boolean(),
  type: z.enum(ORG_TYPES),
  founded: z.number().nullable(),
  dissolved: z.number().nullable(),
  parent_org: z.string().nullable(),
  description: z.string(),
  faction: z.enum(FACTIONS).nullable(),
  tags: z.array(z.enum(ENTITY_TAGS)),
  editorial_notes: z.string(),
});

export const eventSchema = z.object({
  entity_id: z.string(),
  slug: z.string(),
  name: z.string(),
  date: z.string(),
  type: z.enum(EVENT_TYPES),
  description: z.string(),
  body: z.string().nullable(),
  sources: z.array(sourceSchema),
  tags: z.array(z.enum(ENTITY_TAGS)),
  editorial_notes: z.string(),
});

export const connectionSchema = z.object({
  entity_id: z.string(),
  from_entity: z.string(),
  to_entity: z.string(),
  type: z.enum(ALL_RELATIONSHIP_TYPES),
  confidence: z.enum(CONFIDENCE_LEVELS),
  date_from: z.string().nullable(),
  date_to: z.string().nullable(),
  evidence: z.array(evidenceItemSchema),
  intermediaries: z.array(z.string()),
  symmetric: z.boolean(),
  family_subtype: z.enum(FAMILY_SUBTYPES).nullable(),
  editorial_notes: z.string(),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Person = z.infer<typeof personSchema>;
export type Org = z.infer<typeof orgSchema>;
export type Event = z.infer<typeof eventSchema>;
export type Connection = z.infer<typeof connectionSchema>;
export type Entity = Person | Org | Event;

export type Faction = Person["faction"];
export type OrgType = Org["type"];
export type EventType = Event["type"];
export type ConfidenceLevel = Connection["confidence"];
export type FamilySubtype = NonNullable<Connection["family_subtype"]>;
export type RelationshipType = Connection["type"];

// ---------------------------------------------------------------------------
// Zod → TinaCMS field converter
// ---------------------------------------------------------------------------

interface TinaField {
  type: string;
  name: string;
  label: string;
  required?: boolean;
  list?: boolean;
  options?: { value: string; label: string }[];
  fields?: TinaField[];
  collections?: string[];
  ui?: Record<string, unknown>;
  description?: string;
}

interface FieldOverride {
  label?: string;
  ui?: Record<string, unknown>;
  description?: string;
  /** Use TinaCMS "reference" type pointing at these collections */
  reference?: string[];
  /** Use TinaCMS "rich-text" instead of "string" */
  richText?: boolean;
}

type FieldOverrides = Record<string, FieldOverride>;

function zodToTinaField(
  name: string,
  schema: z.ZodType,
  overrides: FieldOverrides = {},
): TinaField | null {
  const ov = overrides[name] ?? {};
  const label = ov.label ?? name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Unwrap nullable
  let inner = schema;
  let isNullable = false;
  if (inner instanceof z.ZodNullable) {
    isNullable = true;
    inner = (inner as z.ZodNullable<z.ZodType>).unwrap();
  }

  // Reference override
  if (ov.reference) {
    return { type: "reference", name, label, collections: ov.reference };
  }

  // Rich-text override
  if (ov.richText) {
    return {
      type: "rich-text",
      name,
      label,
      ...(ov.description && { description: ov.description }),
    };
  }

  // Array
  if (inner instanceof z.ZodArray) {
    const element = inner.element;
    // Array of objects
    if (element instanceof z.ZodObject) {
      const subFields = zodObjectToTinaFields(element);
      return { type: "object", name, label, list: true, fields: subFields };
    }
    // Array of strings
    return { type: "string", name, label, list: true };
  }

  // Enum
  if (inner instanceof z.ZodEnum) {
    return {
      type: "string",
      name,
      label,
      ...(!isNullable && { required: true }),
      options: toOptions(inner.options as string[]),
    };
  }

  // Primitives
  if (inner instanceof z.ZodString) {
    return {
      type: "string",
      name,
      label,
      ...(!isNullable && { required: true }),
      ...(ov.ui && { ui: ov.ui }),
      ...(ov.description && { description: ov.description }),
    };
  }
  if (inner instanceof z.ZodNumber) {
    return { type: "number", name, label };
  }
  if (inner instanceof z.ZodBoolean) {
    return { type: "boolean", name, label };
  }

  // Object
  if (inner instanceof z.ZodObject) {
    const subFields = zodObjectToTinaFields(inner);
    return { type: "object", name, label, fields: subFields };
  }

  return null;
}

function zodObjectToTinaFields(
  schema: z.ZodObject<z.ZodRawShape>,
  overrides: FieldOverrides = {},
): TinaField[] {
  const shape = schema.shape;
  const fields: TinaField[] = [];
  for (const [key, value] of Object.entries(shape)) {
    const field = zodToTinaField(key, value as z.ZodType, overrides);
    if (field) fields.push(field);
  }
  return fields;
}

export function schemaToTinaFields(
  schema: z.ZodObject<z.ZodRawShape>,
  overrides: FieldOverrides = {},
): TinaField[] {
  return zodObjectToTinaFields(schema, overrides);
}
