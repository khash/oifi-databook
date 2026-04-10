---
name: pre-commit-governance
description: Run full pre-commit governance — tests, type checks, Linear updates, and documentation validation before committing
---

# Pre-Commit Governance Enforcement

## Objective
Ensure that before any code is committed, the system is in a **fully validated, consistent, and production-ready state** across:

1. Code (Git)
2. Tests
3. Type safety (TypeScript / Astro)
4. Tasks (Linear — OIFI team)
5. Knowledge base (Notion — OIFI team space)

This is a **blocking protocol**. If any requirement is unmet, the commit MUST NOT proceed.

---

## Dependencies

This skill composes:

- `high-impact-testing`
- Linear MCP integration (OIFI team)
- Notion MCP integration (OIFI team space)

---

## Trigger Conditions

This skill MUST be invoked when:

- A commit is about to be made
- A "commit", "merge", or "finalize" action is requested
- Significant code changes have been completed

---

## Execution Protocol

### Step 1 — Apply High Impact Testing

Invoke: `high-impact-testing`

You MUST:

- Identify all changed code paths
- Classify impact levels
- Ensure all HIGH IMPACT areas are fully tested:
  - Happy paths
  - Edge cases
  - Failure modes

#### Blockers:
- Missing tests for high-impact code
- Untested error paths

---

### Step 2 — Run Lint and Type Checks

You MUST execute:

- `pnpm lint`
- `pnpm typecheck`

#### Requirements:
- Zero lint errors
- Zero type errors
- No suppressed or ignored type failures

#### Blockers:
- Any lint or TypeScript error
- Inconsistent or unsafe types

---

### Step 3 — Validate Linear State

For all relevant Linear tickets (OIFI team only):

#### You MUST:

1. Identify associated tickets:
   - From branch name
   - From commit context
   - From task references

2. Ensure:
   - Status is accurate (e.g. In Progress → Done)
   - Description reflects actual implementation
   - Acceptance criteria are satisfied
   - Technical notes are added if needed

#### Blockers:
- No associated Linear ticket for non-trivial work
- Ticket not updated
- Acceptance criteria not met

---

### Step 4 — Validate Notion / Knowledge Base

Determine if documentation is required (OIFI team space only).

#### Documentation REQUIRED if:
- New feature introduced
- API contract changed
- Architecture modified
- Developer workflow changed
- External behavior changed

#### If required:

- Update relevant documents:
  - API docs
  - Architecture notes
  - Product specs

#### Requirements:
- Documentation matches actual behavior
- No stale or contradictory content

#### Blockers:
- Missing documentation
- Outdated or incorrect documentation

---

### Step 5 — Cross-System Consistency Check

Ensure alignment:

- Code ↔ Tests → correctness validated
- Code ↔ Types → safety enforced
- Code ↔ Linear → intent tracked
- Code ↔ Docs → knowledge preserved

#### Blockers:
- Any inconsistency between systems

---

## Output Requirements

Before allowing commit, produce:

### Summary Report

#### 1. Testing
- Impact classification:
- Tests added/updated:
- Test status:

#### 2. Type Safety
- Lint status:
- Typecheck status:
- Issues (if any):

#### 3. Linear
- Ticket(s):
- Status updates:
- Notes added:

#### 4. Documentation
- Docs updated:
- Locations:
- Summary:

#### 5. Risks
- Any remaining issues or gaps

---

## Non-Negotiable Rules

- DO NOT commit if lint fails
- DO NOT commit if type checks fail
- DO NOT commit without high-impact test coverage
- DO NOT commit without updating Linear (OIFI team)
- DO NOT commit if documentation is stale or missing

---

## Completion Criteria

The task is complete ONLY if:

- All high-impact code is tested
- Lint passes
- Type checks pass
- Linear tickets (OIFI team) are accurate and up to date
- Documentation reflects current system behavior
- No inconsistencies remain

---

## Guiding Principle

> Code is not complete until it is tested, type-safe, tracked, and documented.
