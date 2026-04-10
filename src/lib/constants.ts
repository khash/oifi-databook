// Shared enum constants — single source of truth for types.ts and tina/config.ts

export const SPECTRUM_FACTIONS = [
  "opposition",
  "reformist",
  "pragmatist",
  "conservative",
  "hardliner",
] as const;

export const INSTITUTIONAL_FACTIONS = [
  "military-irgc",
  "technocrat",
  "clerical",
] as const;

export const FACTIONS = [
  ...SPECTRUM_FACTIONS,
  ...INSTITUTIONAL_FACTIONS,
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

// Human-readable inverse labels for connection types viewed from the target entity
export const INVERSE_LABELS: Record<string, string> = {
  "reports-to": "oversees",
  "appointed-by": "appointed",
  oversees: "reports to",
  "member-of": "member included",
  founded: "founded by",
  led: "led by",
  "served-in": "member included",
  "spokesperson-for": "represented by",
  "subsidiary-of": "parent of",
  "affiliated-with": "affiliated with",
  "funded-by": "funder of",
  "aligned-with": "aligned with",
  opposed: "opposed by",
  endorsed: "endorsed by",
  appointed: "appointed by",
  organized: "organized by",
  "participated-in": "participant included",
  "coordinated-with": "coordinated with",
  directed: "directed by",
  recruited: "recruited by",
  "named-in": "names",
  published: "published by",
  "testified-in": "testimony included",
  "subject-of": "covers",
  "family-of": "family of",
  "mentor-of": "mentored by",
};

// Symmetric types — stored once, rendered on both entity profiles
export const SYMMETRIC_TYPES: readonly string[] = [
  "aligned-with",
  "family-of",
];
