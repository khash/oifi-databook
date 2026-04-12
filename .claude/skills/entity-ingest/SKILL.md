---
name: entity-ingest
description: Research an Iranian political entity from a name or Wikipedia URL, extract related people, organizations, and events, reconcile them against the local codebase schema and database, create any missing entities and valid relationships, then run the project's validation steps.
argument-hint: [entity name or wikipedia url]
disable-model-invocation: true
allowed-tools: Read Grep Glob LS Edit Write Bash WebFetch WebSearch TodoWrite
---

# Purpose

Use this skill when asked to ingest or expand a political actor, organization, or event related to Iranian politics into the project's graph/database.

This skill accepts either:
- a plain-text entity name
- a Wikipedia URL
- a Wikipedia page title if the user provides one informally

The goal is to produce **schema-valid, evidence-backed graph updates**:
1. identify the canonical target entity
2. research it thoroughly
3. extract related people, organizations, and events
4. reconcile extracted entities against the existing database/codebase
5. create any missing entities
6. create all justified relationships using only valid relationship types
7. run the project's validation checks
8. stop only when the result is clean or report the exact blocker

Do not invent relationship types, tags, or fields. Always discover them from the codebase first.

---

# Operating rules

## Non-negotiable constraints

- The codebase is the source of truth for:
  - valid entity types
  - valid relationship types
  - valid tags
  - required fields
  - naming conventions
  - uniqueness/canonicalization rules
  - ingestion/validation commands

- Never hardcode schema assumptions if they can be read from the repository.

- Every created or modified entity and relationship must be supported by evidence from reliable sources.

- Prefer primary or high-quality secondary sources:
  - Wikipedia only as a starting point, not the sole basis for contentious claims
  - official biographies
  - recognized news organizations
  - reputable research institutions
  - established human rights organizations or archival sources when relevant

- For disputed facts, use the narrowest defensible statement and capture uncertainty in notes if the schema supports it.

- Do not create speculative links. If the evidence is weak, omit the relationship.

- Before writing, inspect the existing graph to avoid duplicates and near-duplicates.

- At the end, always run the project's validation pipeline.

---

# Closed enum reference — use ONLY these values

These values come from `src/lib/constants.ts` and `scripts/validate-content.mjs`. Using any value not listed here will fail validation.

## Factions (person and org)

opposition, reformist, pragmatist, conservative, hardliner, technocrat, clerical

## Organization types

political-party, state-institution, military, media, business, ngo, religious

## Event types

election, appointment, purge, protest, leak, sanctions, indictment, policy, death

## Confidence levels (connections)

confirmed, alleged, disputed, denied

## Relationship types (28 total, 6 categories)

**Hierarchical:** reports-to, appointed-by, oversees
**Institutional:** member-of, founded, led, headed, served-in, spokesperson-for, subsidiary-of, affiliated-with, funded-by, studied-at
**Political:** aligned-with, opposed, endorsed, appointed
**Operational:** organized, participated-in, coordinated-with, directed, recruited
**Evidentiary:** named-in, published, testified-in, subject-of
**Personal:** family-of, mentor-of

## Symmetric types (must set `symmetric: true`)

aligned-with, family-of

## Family subtypes (required when type is `family-of`, null otherwise)

spouse, sibling, parent, child, in-law

## Entity tags

**Status:** deceased, assassinated, killed-in-action, political-prisoner, house-arrest, in-exile, defunct, banned
**Domain:** judiciary, intelligence, clerical, parliament, executive, military, nuclear, diplomacy
**Thematic:** sanctions, human-rights, jcpoa, green-movement, woman-life-freedom, 1988-massacre, chain-murders, electoral-vetting, proxy-warfare

---

# Validation rules the script enforces

These come from `scripts/validate-content.mjs`. Violating any of them will fail the validation.

- **People** require: entity_id, slug, name_en, role, bio. Include a `sources` array with at least one entry documenting the key reference used.
- **Orgs** require: entity_id, slug, name_en, type, description. Include a `sources` array when sources are available. If parent_org is set, it must match an existing entity_id.
- **Events** require: entity_id, slug, name, date, type, description. Must have at least one source.
- **Connections** require: entity_id, from_entity, to_entity, type, confidence. Both from_entity and to_entity must match existing entity_ids.
- Confirmed connections require at least one evidence item.
- `family-of` connections require a valid family_subtype. Non-family connections must have family_subtype set to null.
- Symmetric types (`aligned-with`, `family-of`) must have `symmetric: true`.
- All intermediaries must match existing entity_ids.
- Entity IDs must be unique across all types (people, orgs, events).
- All tag values must come from the closed ENTITY_TAGS list.
- All enum fields (faction, type, confidence, relationship type) must use exact values from the lists above.

---

# Validation and build commands

After creating or modifying entities, run these commands in order:

1. `pnpm run check:content` — runs the content validator (`scripts/validate-content.mjs`) and checks for unlinked references via `check-unlinked-references.mjs`. This is the fastest feedback loop. Fix all errors AND all `[unlinked-refs]` warnings before proceeding. Every markdown link you wrote must have both a target entity file and a connection file.
2. `pnpm typecheck` — runs `astro check` for TypeScript validation.
3. `pnpm build` — full production build (includes content validation + Astro build + Pagefind index). This also triggers `generate-graph-data.mjs`, which regenerates `public/graph-data.json` from all content files. **The graph is only up to date after a successful build.**

If any step fails, fix the errors and re-run from step 1. Do not consider the task complete until `pnpm build` succeeds — this is what ensures the graph reflects your changes.

---

# Inputs

Input can be one of:
- a person name
- an organization name
- an event name
- a Wikipedia page URL
- a prompt like "ingest X" or "expand X"

If the input is ambiguous, resolve the ambiguity through research and existing database matches before writing.

---

# High-level workflow

## Step 1: Inspect the repository and discover the contract

Before researching the entity, inspect the codebase to find:

1. entity definitions
2. relationship type definitions
3. tag definitions
4. validation rules
5. storage format and ingestion path
6. commands for:
   - local build
   - validation
   - tests
   - graph regeneration or indexing if applicable

Use repository search aggressively. Look for filenames and terms such as:
- schema
- relationships
- relation types
- tags
- entity types
- validators
- zod
- json schema
- prisma
- seed
- ingest
- graph
- people
- organizations
- events

Record for yourself:
- the allowed entity kinds
- the allowed relationship labels
- whether relationships are directional
- whether tags are per-entity-kind or global
- required properties on each entity type
- canonical slug/id rules
- whether aliases are supported
- any existing commands or scripts for adding entities

If there are helper scripts or existing CRUD/insertion commands in the repo, use them rather than editing raw storage by hand.

## Step 2: Resolve the target entity canonically

For the provided name or Wikipedia URL:

1. identify the canonical English name used in the codebase
2. identify aliases/transliterations if the schema supports aliases
3. determine entity kind:
   - person
   - organization
   - event
4. collect a short evidence-backed description
5. identify key dates, roles, and affiliations that help disambiguate the entity

If the repository already contains the entity, treat this as an expansion/update task, not a creation task.

## Step 3: Research thoroughly

Research the target using web sources and repository context.

You must extract:
- directly related people
- directly related organizations
- directly related events

Aim for high-value graph structure, not indiscriminate scraping.

Include relationships that are materially relevant, such as:
- member of
- founder of
- leader of
- affiliated with
- employed by
- allied with
- opposed by
- participated in
- arrested in
- killed in
- sanctioned by
- successor/predecessor relationships
- part of / umbrella organization
- involved in event
- targeted by event
- organizer of event

Use only the exact relationship names allowed by the schema. The examples above are conceptual only.

For each candidate relation, capture:
- source entity
- target entity
- proposed relationship type
- supporting evidence
- confidence
- whether the relation is time-bounded
- any notes needed for disambiguation

Focus on entities that materially improve the graph:
- core political actors
- state institutions
- parties, militias, fronts, security organs, media organs, NGOs, diaspora groups if relevant
- major protests, crackdowns, elections, assassinations, court cases, wars, appointments, dismissals, sanctions events

Do not flood the graph with incidental mentions.

## Step 4: Reconcile against existing data

Before creating anything, search the local database/files for:
- exact name matches
- slug matches
- aliases
- common transliterations
- abbreviated organization names
- event names with date variants

For every candidate entity:
- if an equivalent already exists, reuse it
- if a likely duplicate exists, prefer the existing canonical record unless the schema or evidence clearly requires a new record
- if uncertain, inspect neighboring relationships and descriptions before deciding

Be especially careful with:
- transliteration variants of Persian names
- organizations with renamed branches
- coalitions vs member organizations
- recurring protest waves vs individual incidents
- state institutions vs sub-units

## Step 5: Create missing entities

Create only missing entities that are strongly supported and needed to support valid relationships.

For each new entity:
- use the correct entity type
- use only valid tags from the schema
- populate all required fields
- include aliases if supported
- keep descriptions concise, factual, and neutral
- do not over-tag
- **always populate the `sources` array** with the key references used during research. Each source requires `url`, `title`, `date` (YYYY-MM-DD), and `publisher`. People and orgs must have at least one source entry. This is how the sources sidebar on entity pages is populated.

If the repo has generators, fixtures, or insertion scripts, use them.

## Step 6: Enforce the markdown-link ↔ entity ↔ connection invariant

This project enforces a strict invariant: **every internal markdown link must have a matching entity file AND a matching connection file.** The script `check-unlinked-references.mjs` checks this and will report warnings (or fail the build under `STRICT_LINKS=1`).

Internal links use the format `[Display Name](/people/slug)`, `[Display Name](/orgs/slug)`, or `[Display Name](/events/slug)` inside bio, description, and body fields.

### The rules

1. **Every markdown link target must have a corresponding entity file.** If you write `[IRGC](/orgs/islamic-revolutionary-guard-corps)` in a bio, then `content/orgs/islamic-revolutionary-guard-corps.json` must exist. If it doesn't, either create the entity or don't write the link.

2. **Every markdown link must have a corresponding connection file.** If entity A's bio links to entity B, then a connection file must exist in `content/connections/` that connects A and B (in either direction). If no connection exists, create one with the appropriate relationship type.

3. **Every entity mentioned in text that exists in the DB MUST be a link, not plain text.** A plain-text mention of a DB-resident entity is a silent failure: it breaks graph connectivity, misses a relationship, and launders a relevant affiliation into invisible prose. This is editorially and structurally unacceptable. Plain-text entity mentions are treated as bugs.

4. **Never create a link without both the entity and the connection.** These three things are a unit:
   - The markdown link in the text field
   - The entity JSON file for the target
   - The connection JSON file linking source to target

### Mandatory entity-mention audit (DO NOT SKIP)

Before finalizing any bio, description, or body field, you MUST perform an entity-mention audit. The validator catches *broken* links — it does not catch *missing* links. Missing links are the failure mode this audit exists to prevent.

**Pre-write scan (before you draft the bio):**

List every entity you plan to mention in the prose — every person, organization, event, ministry, party, university, prison, publication, think tank, protest, war, election, and so on. For each one:

1. Check if an entity file already exists. Use `ls content/people/ | grep <slug-fragment>`, `ls content/orgs/`, `ls content/events/`. Try common transliterations and slug variants (e.g. `ali-khamenei`, `khamenei`).
2. If the file exists: **commit to linking it** in the bio. Note the exact slug.
3. If the file does not exist: decide now whether to create it in this run or leave it plain text and add it to the Research Inbox. Do not leave a linkable gap silently.

**Post-write scan (after drafting the bio):**

Re-read every sentence of the bio you just wrote and highlight every proper noun. For each proper noun:

1. Is it a person, org, or event? If yes, it is a link candidate.
2. Is there a matching file in `content/`? If yes, it MUST be a markdown link.
3. Does a connection file link this entity to the target? If no, create one using the appropriate relationship type from the closed set.

**Categories that almost always warrant a link check:**

- Every named person (Khamenei, Khomeini, Soleimani, Mossadegh, the Shah, presidents, FMs, cabinet members, mentioned analysts and authors)
- Every named organization (IRGC, Basij, Quds Force, MOIS, SAVAK, ministries, state media, political parties, think tanks, universities, NGOs, foreign intelligence agencies)
- Every named event (revolutions, wars, coups, elections, protests, assassinations, mass executions, sanctions events, prisoner releases)
- Every named publication or book — if the subject of the book is a DB entity, use `published` to link the author to the subject
- Every named prison, university, or location if it has an entity file (Evin Prison, University of Tehran, Qom)
- Every foreign government or intelligence agency mentioned (CIA, MI6, Mossad, etc.) if they have files

**Common failure pattern to avoid:**

Writing a sentence like *"She served as media and communications assistant at NIAC, founded by Trita Parsi, and met with Javad Zarif in 2014."* where NIAC, Trita Parsi, and Javad Zarif all exist in the DB. All three are unlinkable bugs in the prose — and three missing connections in the graph. The corrected sentence is *"She served as media and communications assistant at [NIAC](/orgs/niac), founded by [Trita Parsi](/people/trita-parsi), and met with [Javad Zarif](/people/javad-zarif) in 2014."* with three matching connection files.

### Workflow for this step

After creating the target entity and all related entities (Step 5):

1. Run the pre-write scan before drafting any bio.
2. Draft the bio using markdown links for every DB-resident mention.
3. Run the post-write scan on every bio, description, and body field you wrote or modified.
4. For each internal markdown link, verify:
   - The target entity file exists in the correct `content/` subdirectory
   - A connection file exists linking the two entities
5. For each entity you created or found in research, check whether it should be linked from the target entity's text fields.
6. Create any missing connection files using the most appropriate relationship type from the closed set.
7. When linking to an existing entity, reuse its exact slug — do not create a duplicate.

### Connection file naming convention

Connection files follow this pattern: `{from_entity}-{relationship_type}-{to_entity}.json`, e.g.:
- `abbas-araghchi-served-in-ministry-of-foreign-affairs.json`
- `ali-khamenei-appointed-ebrahim-raisi.json`

Check existing files in `content/connections/` to match the naming style.

## Step 7: Create relationships

Create all supported relationships between:
- target entity and related entities
- newly added entities and existing entities
- newly added entities with each other when evidence clearly supports it

Rules:
- use only schema-valid relationship types
- obey directionality
- avoid duplicate edges
- attach dates or notes if the schema supports them and the timing matters
- do not infer relationships merely from co-occurrence
- check for existing connection files before creating new ones to avoid duplicates

If a relationship is not represented in the schema, do not fake it with a nearby type. Omit it and mention it in the final summary as a possible schema gap.

## Step 8: Validate, build, and regenerate graph

After all writes:

1. Run `pnpm run check:content` — validates content AND checks for unlinked references. **You must have zero unlinked-reference warnings.** If you see `[unlinked-refs] ⚠` warnings for entities you created or modified, go back and create the missing connection files.
2. Run `pnpm typecheck` — TypeScript validation.
3. Run `pnpm build` — full production build. This also triggers `generate-graph-data.mjs` via the Astro integration, which regenerates `public/graph-data.json` from all entity and connection files. The graph is only current after a successful build.

If any step fails, fix the errors and re-run from step 1. Do not stop until:
- `check:content` shows zero errors AND zero `[unlinked-refs]` warnings
- `pnpm build` succeeds

Typical categories of failures to fix:
- invalid relationship type
- invalid tag
- missing required field
- duplicate slug/id
- broken foreign reference (from_entity or to_entity not found)
- missing connection for a markdown link
- missing entity for a markdown link target
- invalid date format
- `symmetric: true` not set on aligned-with or family-of connections
- `family_subtype` missing on family-of connections or set on non-family connections
- confirmed connections missing evidence

## Step 9: Update Research Inbox (MANDATORY)

During research (Step 3) and entity creation (Steps 5–7), you will inevitably encounter entities — people, organizations, events — that are relevant to the graph but were **not ingested** in this run. Reasons include:

- Out of scope for the current ingestion target
- Insufficient evidence to meet the evidence threshold
- Too many entities to ingest in one session
- Peripheral but potentially important connections

**You MUST capture these in the Notion Research Inbox** so they are not lost.

### Where

The Research Inbox is a Notion page in the OIFI team space under **Databook → Research Inbox**.
- Page ID: `33fcce3d-8035-8126-92ef-ff32b4ce3e40`

### What to capture

For each entity you encountered but did not ingest, append a row to the table with:

| Field | Description |
|---|---|
| **Entity** | Name of the person, org, or event |
| **Type** | person / org / event |
| **Surfaced From** | Which ingestion target or research path led to this entity |
| **Why It Matters** | Brief note on why this entity would improve the graph (e.g. "key Tudeh figure in 1953 coup", "major protest event with no entity file") |
| **Status** | `pending` (default), `ingested`, or `skipped` with reason |

### How

Use the Notion MCP `update-page` tool to append rows to the existing table on the Research Inbox page. Do **not** replace existing rows — only append new ones.

### When to skip

You may skip this step ONLY if:
- Every entity encountered during research was either already in the database or was ingested in this run
- No peripheral entities of any significance were encountered

This should be rare. Most ingestion runs will surface follow-up leads.

## Step 10: Final report

When finished, provide a concise report containing:

1. Canonical target entity resolved
2. Whether it already existed
3. New entities created (with entity type)
4. Existing entities reused
5. Connections created (source → type → target)
6. Markdown links added and verified
7. Any ambiguities or skipped claims
8. Unlinked-reference check result (must be zero warnings for new/modified entities)
9. Build result (confirms graph-data.json is regenerated)
10. Research Inbox entries added (list of entities queued for future ingestion)

If validation failed and you could not resolve it, report:
- exact command run
- exact failing file/entity/relationship
- why it failed
- what manual follow-up is needed

---

# Research standards

## Regime-affiliated figures — never drop, always label (MANDATORY)

Figures who present themselves as independent analysts, academics, or journalists but who are in fact regime spokespersons, state-media surrogates, or covert agents **must be included in the graph** — not excluded. The goal is media literacy: when a user looks up Mohammad Marandi, they should immediately understand how to weight his public statements.

### Rule
**Do not discard an entity merely because it is regime-affiliated.** Affiliation is not a reason to omit — it is a reason to document carefully.

### Required documentation when ingesting a regime-affiliated analyst figure
The bio must include explicit, sourced evidence of affiliation. Include at minimum:
- Their institutional position (e.g. University of Tehran professor, IRGC advisory role)
- Specific documented evidence of regime ties: official adviser roles, IRGC uniform appearances, DOJ or other legal findings, named roles in state media or negotiations
- Which Western outlets have platformmed them as if they were independent (BBC, CNN, Al Jazeera, etc.) — this documents the gap between their public presentation and their actual status
- A clear statement in the bio that they are a regime spokesperson/surrogate, grounded in named sources (IranWire, Iran International, court filings, etc.)

### Spectrum of cases
These figures exist on a spectrum — apply proportionate documentation:

| Type | Examples | What to document |
|---|---|---|
| **Covert agents** | Kaveh Afrasiabi (DOJ-indicted 2021) | Indictment, charges, specific activities |
| **Official regime spokespersons** | Mohammad Marandi (nuclear talks adviser, IRGC-linked) | Advisory role, IRGC uniform evidence, IranWire/Iran International characterisation |
| **State-media surrogates** | Foad Izadi | Specific claims made on Western outlets; links to regime positions |
| **Regime-adjacent academics** | Nasser Hadian, Hassan Ahmadian | Institutional ties; note the bounds of their independence explicitly |
| **Former officials turned analysts** | Hossein Mousavian (ex-nuclear negotiator) | Former regime role; note it prominently so the institutional lens is clear |

### Tagging
Use the most appropriate existing tags. If a figure has documented intelligence or IRGC links, use `intelligence` or `military`. For media surrogates, `media`-adjacent tagging on their org. Do not invent new tag values.

---

## Editorial stance — regime skepticism

The Islamic Republic of Iran is a dictatorship. Research must be unbiased and balanced, but "balanced" does not mean treating regime narratives as equivalent to independent sources. Apply these principles:

- **Default skepticism toward regime-linked sources.** State media (IRNA, PressTV, Fars News, Tasnim, etc.), regime-affiliated institutions, and official government statements carry an inherent propaganda function. Never take them at face value. Cross-reference with independent sources before accepting any claim originating from regime channels.
- **Scrutinize regime framing.** When regime sources characterize dissidents as "terrorists," protesters as "rioters," or political prisoners as "security threats," treat these framings as regime narrative, not fact. Use neutral, evidence-based language instead.
- **Weight human rights sources appropriately.** Reports from Amnesty International, Human Rights Watch, Iran Human Rights, Hrana, and similar organizations documenting repression should be treated as high-quality evidence, not as "one side of the story."
- **Recognize structural coercion.** Forced confessions, show trials, and coerced recantations are well-documented tools of the regime. Do not cite coerced statements as evidence of fact.
- **Do not launder regime legitimacy.** Avoid language that implies democratic legitimacy where none exists (e.g., do not describe sham elections with pre-vetted candidates as genuine democratic exercises without noting the vetting process).
- **Apply asymmetric scrutiny proportionally.** Claims that serve the regime's interests (discrediting opposition, justifying repression, inflating threats) require stronger independent corroboration than claims that document repression or resistance.

This does not mean ignoring factual information that happens to come from regime sources — it means verifying it independently and never privileging regime framing over documented reality.

## Source quality hierarchy

Prefer sources in this order:
1. official / institutional / archival sources
2. major reputable news organizations
3. high-quality reference sources
4. Wikipedia as a launch point for finding sources and for low-risk background facts

Do not rely on a single weak source for controversial or biographical claims.

## Evidence threshold

Create entities or edges only if one of these is true:
- supported by a strong primary source
- supported by two independent reputable secondary sources
- already implied by a trusted existing record in the repo and confirmed externally

## Handling uncertainty

If there are date disputes, office-title disputes, transliteration disputes, or factional ambiguity:
- prefer the least controversial precise statement
- avoid overstating
- use aliases/notes if the schema permits
- omit uncertain edges rather than polluting the graph

---

# Repository discovery checklist

Before editing, explicitly find and understand:

- Where people, organizations, and events are stored
- How relationships are stored
- Whether tags differ by entity kind
- Whether aliases are supported
- Whether descriptions have length/style conventions
- Whether there are codegen steps
- Whether builds regenerate derived graph artifacts
- Whether there are tests specific to data integrity

Use commands and searches such as:
- grep for relationship and tag enums/constants
- read schema and validator files
- inspect a few existing high-quality entities of each type
- inspect a few existing relationship examples

Follow the existing house style exactly.

---

# Execution strategy

## Preferred order of operations

1. inspect schema and examples
2. resolve canonical target
3. research target thoroughly
4. assemble candidate entities/edges
5. deduplicate against existing records
6. **pre-write entity-mention scan** — list every entity you plan to mention, check which ones are already in the DB, commit to linking each
7. create missing entities
8. draft bios using markdown links for every DB-resident mention (never plain text)
9. **post-write entity-mention audit** — re-read each bio and highlight every proper noun; confirm each DB-resident entity is linked and has a connection file
10. create relationships
11. run build/validation
12. fix issues
13. update Research Inbox with follow-up leads
14. summarize

## Editing strategy

- Prefer small, reviewable changes
- If the repo has one-file-per-entity conventions, respect them
- If entity IDs/slugs are generated, use the project’s existing mechanism
- If there are bulk seed/data files, edit them carefully and preserve ordering/style

---

# What good output looks like

A successful run should leave the repository with:
- one canonical target entity resolved
- all high-value directly related entities present
- all supported graph edges added via connection files
- every markdown link in bio/description/body backed by both an entity file and a connection file
- zero `[unlinked-refs]` warnings for any entity you created or modified
- no duplicates introduced
- `pnpm build` passing (which means `public/graph-data.json` is regenerated and up to date)
- Research Inbox updated in Notion with any entities encountered but not ingested

---

# Anti-patterns to avoid

- Hardcoding relationship types from memory instead of using the closed enum set
- Using Wikipedia alone for contentious claims
- Creating dozens of low-value incidental entities
- Inventing tags because they seem useful
- Adding duplicate entities due to transliteration differences
- Creating edges without evidence
- Writing a markdown link without creating the corresponding entity and connection files
- **Mentioning an entity in plain text when it has a file in the database** — the single most common failure mode. Plain-text mentions are invisible to the graph and launder real connections into prose. Always run the pre-write and post-write entity-mention audits described in Step 6.
- Skipping the pre-write entity-mention scan and drafting the bio first — once the prose exists it is easy to miss plain-text mentions
- Relying on `check:content` to catch missing links — the validator catches broken links, not missing links. Missing links pass validation silently and must be caught by the audit
- Creating an entity without connecting it to anything (orphan nodes)
- Stopping before `pnpm build` succeeds (graph-data.json won't be regenerated)
- Stopping with `[unlinked-refs]` warnings for entities you created or modified
- Creating people or orgs without a `sources` array — sources are displayed in the entity sidebar and must be populated from research
- **Dropping a regime-affiliated analyst figure** — include them; document affiliation explicitly with sources
- **Writing a neutral academic bio for a regime spokesperson** without naming their actual status — this launders their credibility in the DB

---

# Example invocation patterns

- `/entity-ingest "Mohsen Rezaee"`
- `/entity-ingest "https://en.wikipedia.org/wiki/Islamic_Revolutionary_Guard_Corps"`
- `/entity-ingest "Mahsa Amini protests"`

---

# Final response format

Return a final response in this structure:

## Result
- target entity:
- entity type:
- existing or newly created:

## Created entities
- ...

## Reused existing entities
- ...

## Created relationships
- source -> relationship_type -> target
- ...

## Validation
- commands run:
- result:

## Research Inbox
- entities added to Notion Research Inbox for future ingestion:
  - entity name (type) — reason
  - ...
- or: "No new leads — all encountered entities were ingested or already existed"

## Notes
- ambiguities:
- omitted low-confidence claims:
- possible schema gaps:
