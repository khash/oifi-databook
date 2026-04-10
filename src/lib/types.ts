import type {
  FACTIONS,
  ORG_TYPES,
  EVENT_TYPES,
  CONFIDENCE_LEVELS,
  FAMILY_SUBTYPES,
} from "./constants";
import type { ALL_RELATIONSHIP_TYPES } from "./constants";

export type Faction = (typeof FACTIONS)[number];
export type OrgType = (typeof ORG_TYPES)[number];
export type EventType = (typeof EVENT_TYPES)[number];
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];
export type FamilySubtype = (typeof FAMILY_SUBTYPES)[number];
export type RelationshipType = (typeof ALL_RELATIONSHIP_TYPES)[number];

export interface EvidenceItem {
  source_url: string;
  source_title: string;
  source_date: string;
  description: string;
}

export interface Source {
  url: string;
  title: string;
  date: string;
  publisher: string;
}

export interface Person {
  entity_id: string;
  slug: string;
  name_en: string;
  name_fa: string;
  has_native_fa_name: boolean;
  aliases: string[];
  born: number | null;
  birthplace: string | null;
  role: string;
  faction: Faction;
  bio: string;
  expertise: string[];
  tags: string[];
  photo: string | null;
}

export interface Org {
  entity_id: string;
  slug: string;
  name_en: string;
  name_fa: string;
  has_native_fa_name: boolean;
  type: OrgType;
  founded: number | null;
  dissolved: number | null;
  parent_org: string | null;
  description: string;
  faction: Faction | null;
  tags: string[];
}

export interface Event {
  entity_id: string;
  slug: string;
  name: string;
  date: string;
  type: EventType;
  description: string;
  body: string | null;
  sources: Source[];
  tags: string[];
}

export interface Connection {
  entity_id: string;
  from_entity: string;
  to_entity: string;
  type: RelationshipType;
  confidence: ConfidenceLevel;
  date_from: string | null;
  date_to: string | null;
  evidence: EvidenceItem[];
  intermediaries: string[];
  symmetric: boolean;
  family_subtype: FamilySubtype | null;
}

/** Union of all entity types that have a slug and can be displayed as a profile page */
export type Entity = Person | Org | Event;
