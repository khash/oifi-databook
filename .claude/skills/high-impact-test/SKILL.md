---
name: high-impact-test
description: Analyze current changes, classify impact levels, and enforce testing for all high-impact code paths
argument-hint: "[scope=<path>] or [files=<file1,file2>] (optional)"
---

# High Impact Test

Analyze the current changes (or specified scope) and ensure all high-impact code paths have meaningful test coverage. This is about **risk-weighted testing**, not blanket coverage %.

## Arguments

$ARGUMENTS

---

## What Is High-Impact Code

Treat code as *high-impact* if it meets ANY of the following:

1. **User-facing critical paths** — data display, form submissions, API request/response, data mutations
2. **Security-sensitive logic** — input validation, permission checks, token handling
3. **Stateful / data integrity** — API calls, data transformations, state management
4. **Integration boundaries** — external APIs, data fetching, third-party services
5. **Complex logic** — branch-heavy conditionals, non-trivial algorithms, data processing

Default to **high** unless clearly trivial.

---

## Execution Steps

### Step 1 — Detect Changes
- Run: `git status` and `git diff`
- Identify modified, new, and deleted files

### Step 2 — Impact Classification
For each change, determine if it touches APIs, data handling, external integrations, or core business logic.

Label each as: `HIGH IMPACT` (default if uncertain), `MEDIUM IMPACT`, or `LOW IMPACT`

### Step 3 — Enforce Testing

For every **HIGH IMPACT** area:

**If tests exist:** evaluate coverage quality (happy path, edge cases, failure paths)

**If tests are missing or insufficient**, create or update tests covering:
- Valid scenarios
- Invalid inputs
- Error handling
- Integration behavior (if applicable)

**Test quality requirements:**
- Deterministic (no flaky timing)
- Avoid over-mocking core logic
- Validate behavior, not implementation details
- Assert meaningful outcomes (not just "no error")

### Step 4 — Regression Safety
If any bug fix is detected: ensure a failing test is added first, then ensure the fix passes.

### Step 5 — Run Tests
- Execute project test suite
- Run `pnpm typecheck` for type safety
- Resolve failures before completion

---

## Output Format

Return a structured report:

### Impact Analysis
- File: <path>
  - Impact: HIGH / MEDIUM / LOW
  - Reason:

### Test Actions
- Added:
- Updated:
- Existing (validated):

### Coverage Summary
- Scenarios covered:
- Missing scenarios (if any):

### Risks
- Any remaining untested high-impact paths

---

## Red Flags (Must Fix)

You MUST intervene if you detect: untested data mutations, untested error handling, silent failures (ignored errors), new pages/endpoints without tests, refactors that remove test coverage.

---

## Non-Negotiable Rules

- Do NOT complete if high-impact code lacks tests
- Do NOT rely on superficial coverage
- Prefer behavior validation over mocks

---

## Completion Criteria

The command is complete ONLY when:
- All high-impact changes are tested
- Tests pass
- No critical paths remain unverified
