// Shared enum constants — single source of truth for types.ts and tina/config.ts

export const FACTIONS = [
  "pragmatist",
  "reformist",
  "conservative",
  "hardliner",
  "military-irgc",
  "technocrat",
  "clerical",
] as const;

export const ORG_TYPES = [
  "political-party",
  "state-institution",
  "military",
  "media",
  "business",
  "ngo",
  "religious",
] as const;

export const EVENT_TYPES = [
  "election",
  "appointment",
  "purge",
  "protest",
  "leak",
  "sanctions",
  "indictment",
  "policy",
  "death",
] as const;

export const CONFIDENCE_LEVELS = [
  "confirmed",
  "alleged",
  "disputed",
  "denied",
] as const;

export const FAMILY_SUBTYPES = [
  "spouse",
  "sibling",
  "parent",
  "child",
] as const;

// 26 relationship types across 6 categories
export const RELATIONSHIP_TYPES = {
  hierarchical: ["reports-to", "appointed-by", "oversees"] as const,
  institutional: [
    "member-of",
    "founded",
    "led",
    "served-in",
    "spokesperson-for",
    "subsidiary-of",
    "affiliated-with",
    "funded-by",
  ] as const,
  political: [
    "aligned-with",
    "opposed",
    "endorsed",
    "appointed",
  ] as const,
  operational: [
    "organized",
    "participated-in",
    "coordinated-with",
    "directed",
    "recruited",
  ] as const,
  evidentiary: [
    "named-in",
    "published",
    "testified-in",
    "subject-of",
  ] as const,
  personal: ["family-of", "mentor-of"] as const,
} as const;

export type RelationshipCategory = keyof typeof RELATIONSHIP_TYPES;

// Flat array of all 26 types for use in TinaCMS options and validation
export const ALL_RELATIONSHIP_TYPES = [
  ...RELATIONSHIP_TYPES.hierarchical,
  ...RELATIONSHIP_TYPES.institutional,
  ...RELATIONSHIP_TYPES.political,
  ...RELATIONSHIP_TYPES.operational,
  ...RELATIONSHIP_TYPES.evidentiary,
  ...RELATIONSHIP_TYPES.personal,
] as const;

// Symmetric types — stored once, rendered on both entity profiles
export const SYMMETRIC_TYPES: readonly string[] = [
  "aligned-with",
  "family-of",
];
