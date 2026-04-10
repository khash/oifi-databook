import { defineConfig, type Collection, type TinaField } from "tinacms";
import {
  FACTIONS,
  ORG_TYPES,
  EVENT_TYPES,
  CONFIDENCE_LEVELS,
  FAMILY_SUBTYPES,
  ALL_RELATIONSHIP_TYPES,
} from "../src/lib/constants";

function toOptions(values: readonly string[]) {
  return values.map((v) => ({ value: v, label: v.replace(/-/g, " ") }));
}

const editorialNotes: TinaField = {
  type: "string",
  name: "editorial_notes",
  label: "Editorial Notes",
  description: "Internal only — never shown on site",
  ui: { component: "textarea" },
};

const personCollection: Collection = {
  name: "person",
  label: "People",
  path: "content/people",
  format: "json",
  fields: [
    { type: "string", name: "entity_id", label: "Entity ID", required: true },
    { type: "string", name: "slug", label: "URL Slug", required: true },
    { type: "string", name: "name_en", label: "Name (English)", required: true },
    { type: "string", name: "name_fa", label: "Name (Persian)", required: true },
    {
      type: "string",
      name: "aliases",
      label: "Aliases",
      list: true,
    },
    { type: "number", name: "born", label: "Birth Year" },
    { type: "string", name: "birthplace", label: "Birthplace" },
    { type: "string", name: "role", label: "Role", required: true },
    {
      type: "string",
      name: "faction",
      label: "Faction",
      required: true,
      options: toOptions(FACTIONS),
    },
    {
      type: "string",
      name: "bio",
      label: "Biography",
      required: true,
      ui: { component: "textarea" },
    },
    {
      type: "string",
      name: "expertise",
      label: "Expertise",
      list: true,
    },
    { type: "string", name: "photo", label: "Photo URL" },
    editorialNotes,
  ],
};

const orgCollection: Collection = {
  name: "org",
  label: "Organisations",
  path: "content/orgs",
  format: "json",
  fields: [
    { type: "string", name: "entity_id", label: "Entity ID", required: true },
    { type: "string", name: "slug", label: "URL Slug", required: true },
    { type: "string", name: "name_en", label: "Name (English)", required: true },
    { type: "string", name: "name_fa", label: "Name (Persian)", required: true },
    {
      type: "string",
      name: "type",
      label: "Organisation Type",
      required: true,
      options: toOptions(ORG_TYPES),
    },
    { type: "number", name: "founded", label: "Founded (Year)" },
    { type: "number", name: "dissolved", label: "Dissolved (Year)" },
    {
      type: "reference",
      name: "parent_org",
      label: "Parent Organisation",
      collections: ["org"],
    },
    {
      type: "string",
      name: "description",
      label: "Description",
      required: true,
      ui: { component: "textarea" },
    },
    {
      type: "string",
      name: "faction",
      label: "Faction",
      options: toOptions(FACTIONS),
    },
    editorialNotes,
  ],
};

const eventCollection: Collection = {
  name: "event",
  label: "Events",
  path: "content/events",
  format: "json",
  fields: [
    { type: "string", name: "entity_id", label: "Entity ID", required: true },
    { type: "string", name: "slug", label: "URL Slug", required: true },
    { type: "string", name: "name", label: "Event Name", required: true },
    { type: "string", name: "date", label: "Date (YYYY or YYYY-MM or YYYY-MM-DD)", required: true },
    {
      type: "string",
      name: "type",
      label: "Event Type",
      required: true,
      options: toOptions(EVENT_TYPES),
    },
    {
      type: "string",
      name: "description",
      label: "Description",
      required: true,
      ui: { component: "textarea" },
    },
    {
      type: "rich-text",
      name: "body",
      label: "Body",
      description: "Full editorial text (markdown)",
    },
    {
      type: "object",
      name: "sources",
      label: "Sources",
      list: true,
      fields: [
        { type: "string", name: "url", label: "URL", required: true },
        { type: "string", name: "title", label: "Title", required: true },
        { type: "string", name: "date", label: "Date", required: true },
        { type: "string", name: "publisher", label: "Publisher", required: true },
      ],
    },
    editorialNotes,
  ],
};

const connectionCollection: Collection = {
  name: "link",
  label: "Connections",
  path: "content/connections",
  format: "json",
  fields: [
    { type: "string", name: "entity_id", label: "Entity ID", required: true },
    { type: "string", name: "from_entity", label: "From Entity (ID)", required: true },
    { type: "string", name: "to_entity", label: "To Entity (ID)", required: true },
    {
      type: "string",
      name: "type",
      label: "Relationship Type",
      required: true,
      options: toOptions(ALL_RELATIONSHIP_TYPES),
    },
    {
      type: "string",
      name: "confidence",
      label: "Confidence",
      required: true,
      options: toOptions(CONFIDENCE_LEVELS),
    },
    { type: "string", name: "date_from", label: "Date From" },
    { type: "string", name: "date_to", label: "Date To" },
    {
      type: "object",
      name: "evidence",
      label: "Evidence",
      list: true,
      fields: [
        { type: "string", name: "source_url", label: "Source URL", required: true },
        { type: "string", name: "source_title", label: "Source Title", required: true },
        { type: "string", name: "source_date", label: "Source Date", required: true },
        { type: "string", name: "description", label: "Description", required: true },
      ],
    },
    {
      type: "string",
      name: "intermediaries",
      label: "Intermediaries (Entity IDs)",
      list: true,
    },
    { type: "boolean", name: "symmetric", label: "Symmetric" },
    {
      type: "string",
      name: "family_subtype",
      label: "Family Subtype",
      options: toOptions(FAMILY_SUBTYPES),
    },
    editorialNotes,
  ],
};

export default defineConfig({
  branch: "main",
  clientId: "",
  token: "",
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "media",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      personCollection,
      orgCollection,
      eventCollection,
      connectionCollection,
    ],
  },
});
