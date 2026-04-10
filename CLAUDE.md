# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

OIFI Databook — an Astro 5 site with React islands, Tailwind CSS v4, and shadcn/ui (radix-nova style).

## Commands

- `pnpm dev` — dev server on port 8321
- `pnpm build` — production build
- `pnpm lint` — ESLint
- `pnpm format` — Prettier (ts, tsx, astro)
- `pnpm typecheck` — `astro check`

## Architecture

- **Astro pages** in `src/pages/` — `.astro` files, file-based routing
- **Layouts** in `src/layouts/` — `main.astro` is the base HTML shell
- **React components** in `src/components/` — rendered as islands with `client:load` directives
- **shadcn/ui** components in `src/components/ui/` — add via `pnpm dlx shadcn@latest add <component>`
- **Path aliases**: `@/` maps to `src/` (e.g. `@/components`, `@/lib`)
- **Styles**: Tailwind v4 via Vite plugin, global CSS in `src/styles/global.css`
- **Utilities**: `cn()` helper in `src/lib/utils.ts` (clsx + tailwind-merge)
