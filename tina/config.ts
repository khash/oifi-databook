import { defineConfig, type Collection, type TinaField } from "tinacms";
import {
  personSchema,
  orgSchema,
  eventSchema,
  connectionSchema,
  schemaToTinaFields,
} from "../src/lib/schema";

/** Cast generic field output to TinaCMS's discriminated union */
function tinaFields(
  ...args: Parameters<typeof schemaToTinaFields>
): TinaField[] {
  return schemaToTinaFields(...args) as TinaField[];
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
    ...tinaFields(personSchema, {
      name_en: { label: "Name (English)" },
      name_fa: { label: "Name (Persian)" },
      has_native_fa_name: { label: "Has Native Persian Name" },
      born: { label: "Birth Year" },
      bio: { ui: { component: "textarea" } },
      photo: { label: "Photo URL" },
    }),
    editorialNotes,
  ],
};

const orgCollection: Collection = {
  name: "org",
  label: "Organisations",
  path: "content/orgs",
  format: "json",
  fields: [
    ...tinaFields(orgSchema, {
      name_en: { label: "Name (English)" },
      name_fa: { label: "Name (Persian)" },
      has_native_fa_name: { label: "Has Native Persian Name" },
      type: { label: "Organisation Type" },
      founded: { label: "Founded (Year)" },
      dissolved: { label: "Dissolved (Year)" },
      parent_org: { label: "Parent Organisation", reference: ["org"] },
      description: { ui: { component: "textarea" } },
    }),
    editorialNotes,
  ],
};

const eventCollection: Collection = {
  name: "event",
  label: "Events",
  path: "content/events",
  format: "json",
  fields: [
    ...tinaFields(eventSchema, {
      name: { label: "Event Name" },
      date: { label: "Date (YYYY or YYYY-MM or YYYY-MM-DD)" },
      type: { label: "Event Type" },
      description: { ui: { component: "textarea" } },
      body: { richText: true, description: "Full editorial text (markdown)" },
    }),
    editorialNotes,
  ],
};

const connectionCollection: Collection = {
  name: "link",
  label: "Connections",
  path: "content/connections",
  format: "json",
  fields: [
    ...tinaFields(connectionSchema, {
      from_entity: { label: "From Entity (ID)" },
      to_entity: { label: "To Entity (ID)" },
      type: { label: "Relationship Type" },
      date_from: { label: "Date From" },
      date_to: { label: "Date To" },
      intermediaries: { label: "Intermediaries (Entity IDs)" },
      family_subtype: { label: "Family Subtype" },
    }),
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
