# Research Checklist: Political Entity Ingestion

## 1. Entity Resolution
- Confirm canonical English name
- Identify Persian name (if applicable)
- Identify aliases / transliterations
- Determine entity type:
  - [ ] Person
  - [ ] Organization
  - [ ] Event

## 2. Core Attributes
- Description (1–2 sentences, neutral)
- Key dates (birth, founding, major milestones)
- Roles / positions (for people)
- Structure / type (for organizations)
- Timeline (for events)

## 3. Related Entities Extraction

### People
- Founders
- Leaders
- Key associates
- Rivals / opponents

### Organizations
- Affiliations
- Parent organizations
- Sub-organizations
- Alliances

### Events
- Participation in events
- Events caused by or involving entity
- Legal actions / arrests / protests / wars

## 4. Relationship Candidates

For each candidate:
- Source entity:
- Target entity:
- Relationship type (must match schema):
- Evidence source:
- Confidence: High / Medium / Low

## 5. Source Verification
- At least 2 independent sources for non-trivial claims
- Prefer:
  - Official sources
  - Major news outlets
  - Academic / institutional sources

## 6. Deduplication Checks
- Existing entity with same name?
- Alternate transliteration exists?
- Same org under different name?
- Event already represented under different title?

## 7. Creation Readiness
Before creating:
- [ ] Not already in database
- [ ] Schema-compatible fields ready
- [ ] Tags valid per schema
- [ ] Relationships validated against schema

## 8. Final Sanity Check
- No speculative relationships
- No invalid relationship types
- No duplicate entities
- All entities have required fields
