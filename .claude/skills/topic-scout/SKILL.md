---
name: topic-scout
description: Given a subject or topic related to Iranian politics, cast a wide net to discover all people, organizations, and events worth investigating. Reconcile against the existing database to avoid duplicates, flag existing entities that need updates or deeper research, and append every new lead to the Notion Research Inbox. This skill surveys — it does not ingest.
argument-hint: [subject or topic]
disable-model-invocation: true
model: claude-opus-4-6
reasoning_effort: high
allowed-tools: Read Grep Glob LS Bash WebFetch WebSearch TodoWrite
---

# Purpose

Use this skill when asked to survey a **topic, subject, theme, period, event cluster, network, or domain** related to Iranian politics and produce a comprehensive list of entities worth researching.

This skill is **discovery-oriented**, not ingestion-oriented. It does not create entity files, connections, or run the build. Its single deliverable is a rich, deduplicated set of rows appended to the **Notion Research Inbox** so that `entity-ingest` (or a human) can work through the queue.

Example topics:
- "the 1988 prison massacre"
- "Iran's nuclear program leadership"
- "Quds Force activities in Syria"
- "Green Movement organizers"
- "regime-linked media networks"
- "judiciary figures involved in show trials"
- "IRGC economic holdings"
- "2022 Woman, Life, Freedom movement"

---

# Core principle

**Cast a wide net.** For ingestion, evidence thresholds are strict. For scouting, the bar is lower: if an entity is *plausibly relevant* to the topic and *worth a closer look*, surface it. The Research Inbox is a queue, not a commitment — each row will be independently evaluated later.

But wide does not mean sloppy:
- Every lead must have a clear reason it is relevant to the topic
- Every lead must be checked against the existing database to avoid duplicate inbox entries
- Every existing entity that intersects the topic must also be reported, with a note on what update or deeper research it needs

---

# Operating rules

- Do **not** create, modify, or delete entity or connection files.
- Do **not** run `pnpm build`, `pnpm check:content`, or other write-path commands.
- Do **not** write to the codebase at all. Read-only except for the Notion Research Inbox.
- The codebase is still the source of truth for what already exists — read it before declaring any lead "new".
- Persian political context matters: include clerical, military, security, judicial, media, diaspora, and opposition actors — not just cabinet-level politicians.
- Apply the regime-skepticism editorial stance (see below). Surface regime narratives only as objects of study, never as authoritative framings.
- **Never drop regime-affiliated figures.** See the dedicated rule below.

---

# Editorial stance — regime skepticism

The Islamic Republic of Iran is a dictatorship. Apply these principles when scouting:

- Default skepticism toward regime-linked sources (IRNA, PressTV, Fars, Tasnim, official statements). Use them to locate names, not to validate framings.
- Weight human rights sources (Amnesty, HRW, Iran Human Rights, Hrana, Abdorrahman Boroumand Center, Iran Wire) as high-quality evidence.
- Recognize structural coercion: forced confessions, show trials, coerced recantations are regime tools — treat named "confessors" as victims, not perpetrators.
- Do not launder regime legitimacy. Sham elections, pre-vetted candidates, and staged events should be described as such.
- Apply asymmetric scrutiny: claims that serve regime interests require stronger corroboration than claims documenting repression.

When surfacing an entity, neutral framing in the "Why It Matters" field is fine, but do not repeat regime labels ("rioter", "terrorist", "anti-security element") as if they were neutral descriptions.

---

# Regime-affiliated analysts — never drop, always flag (MANDATORY)

Figures who present themselves as independent experts but who are regime spokespersons, state-media surrogates, or covert agents **must be surfaced and added to the inbox** — not filtered out. The DB serves media-literacy purposes: a user looking up a figure should immediately know how to read their public comments.

## Rule

**Never drop an entity because it is regime-affiliated.** That affiliation is precisely why it belongs in the graph.

## What to put in "Why It Matters" for these figures

The "Why It Matters" field must do the media-literacy work. Include:

1. **How they are presented** — which Western outlets platform them as if they were independent (BBC, CNN, Al Jazeera, Channel 4, etc.)
2. **What they actually are** — specific documented evidence of regime ties:
   - Official advisory roles (e.g. nuclear talks delegation adviser)
   - IRGC or security apparatus links (uniform photos, named roles)
   - DOJ, court, or sanctions findings
   - Named characterisations by credible sources (IranWire, Iran International, court filings)
3. **Why the distinction matters for graph users** — e.g. "When Marandi appears as a BBC guest, the DB should immediately signal his status so the viewer can weight his claims correctly."

## Spectrum — apply proportionate documentation

| Type | How to flag |
|---|---|
| **Covert agents** (e.g. Afrasiabi, DOJ-indicted) | Note indictment, charges, specific activities |
| **Official regime spokespersons** (e.g. Marandi) | Advisory role, IRGC evidence, IranWire/Iran International characterisation |
| **State-media surrogates** (e.g. Foad Izadi) | Specific claims made on Western outlets; alignment with regime positions |
| **Regime-adjacent academics** (e.g. Hadian, Ahmadian) | Institutional ties; state explicitly that independence is bounded |
| **Former officials turned analysts** (e.g. Mousavian) | Former regime role must be the lead fact — not buried |

## Anti-pattern to avoid

Do **not** write: "Marandi is a professor at University of Tehran who comments on Iran policy." That launders his status.

Do write: "Presents as an independent academic but serves as an official adviser to Iran's nuclear delegation and has been photographed in IRGC uniform. IranWire calls him 'Iran's chief propagandist in English.' Regularly platformed on BBC, CNN, and Al Jazeera without this context."

---

# Workflow

## Step 1: Understand the topic

Clarify the scope of the topic before searching:
- Is it an event, a period, a network, a theme, an institution, a policy area?
- What is the approximate time range?
- What are the adjacent topics that should and should not be in scope?

If the user's phrasing is ambiguous, pick the most defensible interpretation and state it explicitly in the final report. Do not ask the user to refine unless the topic is truly uninterpretable.

## Step 2: Discover the existing database

Before any web research, map what already exists in the codebase that intersects the topic:

- `grep` / `glob` across `content/people/`, `content/orgs/`, `content/events/` for obvious keywords, date ranges, and related terms.
- Read the Zod schema and constants (`src/lib/schema.ts`, `src/lib/constants.ts`) to refresh the vocabulary of entity types, factions, org types, event types, and tags.
- Skim a handful of existing entity files adjacent to the topic to understand coverage depth and style.

Build two mental lists:
1. **Existing entities already in the database** that are part of this topic.
2. **Gaps** — sub-areas of the topic where the database has nothing.

## Step 3: Research widely

Use `WebSearch` and `WebFetch` aggressively. Do not stop at the first wave of sources. Keep expanding until you hit diminishing returns. Sources to mine:

- Wikipedia articles and their reference lists (use references, not just Wikipedia itself)
- Major reputable news organizations (BBC, Reuters, NYT, WaPo, Guardian, AP, AFP, FT, Economist)
- Iran-focused outlets (Iran Wire, Radio Farda, BBC Persian, VOA Persian, Kayhan London)
- Human rights organizations (Amnesty, HRW, Iran Human Rights, Hrana, Boroumand Center, CHRI, UN Special Rapporteur reports)
- Academic and think-tank sources (Middle East Institute, Washington Institute, RUSI, IISS, Carnegie, Crisis Group, Atlantic Council, Chatham House)
- Court filings, indictments, sanctions designations (OFAC, UK/EU sanctions lists)
- Memoirs, oral histories, archival projects

For each wave of research, extract every person, organization, and event that is plausibly relevant to the topic. Do not filter too aggressively at this stage.

## Step 4: Classify every candidate

For each candidate entity, classify it into one of four buckets:

### A. Already in database, coverage adequate
No action needed. Note in final report as context only.

### B. Already in database, needs update or deeper research
Examples:
- Bio is thin or missing key role during the topic period
- No connections to other topic entities
- Missing sources, missing tags, missing Persian name
- Death date, new role, or new evidence has emerged

These go into the Research Inbox with **Status: needs-update** and a specific note on what to add.

### C. Not in database, clearly worth ingesting
High-signal entities that belong in the graph. Status: `pending`.

### D. Not in database, speculative or peripheral
Lower-signal but still plausibly relevant. Status: `pending` with a note flagging the lower confidence. Let the ingest step apply its evidence threshold.

Do **not** discard D-bucket entities silently — the point of scouting is to cast wide. But mark them clearly so the ingest step can triage.

## Step 5: Deduplicate against the Research Inbox

Before appending, fetch the current Research Inbox contents via the Notion MCP and check for existing rows that already cover your lead. If a row exists:
- Skip it if the existing row is adequate
- If your new context adds value (better "Why It Matters", new surfaced-from path), consider updating the row rather than duplicating

Never create duplicate inbox rows.

## Step 6: Append to the Research Inbox

Research Inbox location: **Databook → Research Inbox** in the OIFI team space.
- Page ID: `33fcce3d-8035-8126-92ef-ff32b4ce3e40`

For each lead, append a row with:

| Field | Description |
|---|---|
| **Entity** | Canonical English name (Persian name in parentheses if helpful) |
| **Type** | person / org / event |
| **Surfaced From** | The topic you were scouting, plus the specific research path or source that surfaced it |
| **Why It Matters** | One or two sentences on why this entity would improve the graph for this topic. Be specific — "key figure" is not enough. |
| **Status** | `pending` (new lead) / `needs-update` (exists but incomplete) / `skipped` with reason |

Use the Notion MCP `notion-update-page` or equivalent append tool. **Append only — never replace existing rows.**

If the Notion MCP is unavailable, stop and report the failure. Do not silently lose leads.

## Step 7: Final report

Produce a concise summary containing:

- Topic as interpreted
- Scope decisions (time range, what's in/out)
- Count of leads by bucket (A/B/C/D)
- List of existing entities flagged for update (bucket B) with the specific ask
- List of new leads added to the inbox (buckets C and D), grouped by entity type
- Any sub-areas of the topic where the signal was weak and coverage may be thin
- Any schema gaps observed (e.g. a relationship type that seems needed but doesn't exist)

---

# Heuristics for casting a wide net

When surveying a topic, systematically consider each of these categories and search for entities in each:

**Actors**
- Principal figures (leaders, founders, commanders)
- Deputies, successors, predecessors
- Deceased figures whose legacy shapes the topic
- Victims, survivors, witnesses
- Defectors, dissenters, whistleblowers
- Diaspora figures connected to the topic
- Foreign counterparts (allies, adversaries, mediators)

**Institutions**
- State organs (ministries, councils, offices)
- Security and intelligence organs (MOIS, IRGC-IO, Basij, Ansar-e Hezbollah, etc.)
- Military branches and units
- Parliamentary factions and committees
- Judiciary bodies and special courts
- Clerical institutions (seminaries, Friday prayer networks, marja offices)
- Parties, fronts, coalitions
- Front companies, foundations (bonyads), economic holdings
- Media outlets (state, semi-state, affiliated private)
- Universities and academic networks
- NGOs, diaspora organizations, opposition groups

**Events**
- Major incidents (protests, crackdowns, assassinations, attacks)
- Elections, appointments, purges, dismissals
- Court cases, indictments, executions
- Sanctions designations, diplomatic incidents
- Leaks, scandals, public confessions
- Policy announcements, treaty moments
- Strikes, sit-ins, collective actions

**Structural context**
- Precursor events (what set this up)
- Consequences (what this enabled or triggered)
- Parallel events in the same period that interact with the topic

Aim for breadth across all these categories before going deep on any one.

---

# What good output looks like

A successful run produces:
- A clear interpretation of the topic
- A thorough, deduplicated set of Research Inbox rows covering the topic's people, orgs, and events
- Explicit flags on existing entities that need updates
- No codebase modifications
- A final report that a human or `entity-ingest` run can act on directly

---

# Anti-patterns to avoid

- Creating entity or connection files (this is the ingest skill's job, not this one)
- Running `pnpm build` or any write-path command
- Appending duplicate rows to the Research Inbox
- Filtering so aggressively that peripheral-but-relevant leads are lost
- Accepting regime framings uncritically
- Stopping after one wave of sources
- Leaving existing database entities unexamined (every topic run must also audit what's already there)
- Vague "Why It Matters" entries — each lead needs a specific justification
- Silently dropping leads if the Notion MCP fails — report the failure instead
- **Dropping a figure because they are regime-affiliated** — affiliation is a reason to include and document, not to exclude
- **Writing a neutral academic bio for a regime spokesperson** without surfacing their actual status — this launders their credibility

---

# Example invocation patterns

- `/topic-scout "1988 prison massacre"`
- `/topic-scout "IRGC economic holdings"`
- `/topic-scout "Quds Force in Syria 2011-2024"`
- `/topic-scout "Woman Life Freedom movement organizers"`
- `/topic-scout "judiciary figures in show trials"`

---

# Final response format

## Topic
- as given:
- as interpreted (scope, time range, boundaries):

## Database audit
- existing entities already covering this topic (adequate): N
- existing entities needing update (bucket B): N
- gaps identified: ...

## New leads added to Research Inbox
### People
- Name (surfaced from → source) — why it matters
- ...

### Organizations
- ...

### Events
- ...

## Existing entities flagged for update
- entity slug — what needs to be added/corrected

## Coverage notes
- sub-areas where signal was weak:
- possible schema gaps:
- regime-narrative caveats applied:

## Inbox write result
- number of rows appended:
- number of duplicates skipped:
- any MCP failures:
