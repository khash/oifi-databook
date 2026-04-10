# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

OIFI Databook — a data-driven site for exploring Iranian political networks. Astro 5, React islands, Tailwind CSS v4, shadcn/ui (radix-nova), deployed to https://databook.oifi.org.

## Commands

- `pnpm dev` — build + Pagefind index + dev server on port 8321
- `pnpm build` — production build + Pagefind index
- `pnpm cms` — TinaCMS dev mode (`tinacms dev -c "astro dev"`)
- `pnpm cms:build` — TinaCMS build + Astro build
- `pnpm lint` — ESLint
- `pnpm format` — Prettier (ts, tsx, astro)
- `pnpm typecheck` — `astro check`

## Architecture

- **Astro pages** in `src/pages/` — `.astro` files, file-based routing
- **Layouts** in `src/layouts/` — `main.astro` (base HTML shell), `entity.astro` (detail page with sidebar + bottom slots)
- **React components** in `src/components/` — rendered as islands with `client:load` directives
- **shadcn/ui** components in `src/components/ui/` — add via `pnpm dlx shadcn@latest add <component>`
- **Path aliases**: `@/` maps to `src/` (e.g. `@/components`, `@/lib`)
- **Styles**: Tailwind v4 via Vite plugin, global CSS in `src/styles/global.css`
- **Utilities**: `cn()` helper in `src/lib/utils.ts` (clsx + tailwind-merge)

## Data Layer

- **Content**: JSON files in `/content/` — `people/`, `orgs/`, `events/`, `connections/`
- **Schema**: Zod definitions in `src/lib/schema.ts` — single source of truth for types, validation, and TinaCMS field generation
- **Data access**: All reads go through `src/lib/content.ts` — never import JSON directly. Editorial notes are stripped automatically.
- **Constants**: Enum values, relationship types (26 across 6 categories), inverse labels, symmetric types in `src/lib/constants.ts`
- **Graph**: Pre-computed at build time via `src/scripts/generate-graph-data.ts` → `/public/graph-data.json`. Triggered by Astro integration in `astro.config.mjs`.
- **Search**: Pagefind full-text index built at build time into `/public/pagefind/`
- **CMS**: TinaCMS configured in `/tina/config.ts`, fields auto-generated from Zod schemas

## Entity Model

Three entity types: **Person**, **Org**, **Event** — each with `entity_id` and `slug`. Connected by **Connection** records (`from_entity` → `to_entity`) with relationship type, confidence level, date range, and evidence.

- Persons have factions (opposition → hardliner spectrum), bilingual names (en/fa), bios (markdown)
- Orgs have types (political-party, state-institution, military, etc.), optional parent_org
- Events have typed dates (YYYY or YYYY-MM or YYYY-MM-DD), optional body (markdown), sources
- Connections have 26 relationship types, confidence levels (confirmed/alleged/disputed/denied), optional intermediaries

## Key Components

- **GraphExplorer.tsx** — orchestrates interactive network graph (depth 1°/2°/3°, breadcrumbs, BFS subgraph via `src/lib/graph-bfs.ts`)
- **FlowGraph.tsx** — @xyflow/react + Dagre layout, custom EntityNode rendering
- **Search.tsx** — Pagefind integration, debounced, grouped results by type
- **ConnectionsList.tsx** — filterable relationship list with confidence badges
- **FactionSpectrum.tsx** — visual political spectrum slider
- **ThemeToggle.tsx** — light/dark mode with localStorage persistence

## Conventions

- Bilingual: English primary, Persian (`name_fa`) secondary with `dir="rtl" lang="fa"`
- Markdown in bios/descriptions rendered via `marked` (GFM). Internal links use `[Name](/people/slug)` format.
- Editorial notes (`editorial_notes` field) are internal-only — never exposed to frontend
- Static generation via `getStaticPaths()`. Client router for smooth page transitions.
- Graph navigation syncs with browser history (back/forward)
