# تيك ستارت (Tech Start)

Arabic-language tech platform serving as a portal for AI tools, programming tutorials, and technical articles — powered by Supabase for content and an Express API for admin auth.

## Run & Operate

- `pnpm --filter @workspace/tech-start run dev` — run the frontend (Vite dev server)
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (not yet actively used; app uses Supabase directly)
- Optional env: `ADMIN_USERNAME`, `ADMIN_PASSWORD` — admin credentials (defaults: admin / password)
- Optional env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — Supabase credentials (hardcoded fallbacks exist)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + React 19, Tailwind CSS v4, `motion/react` animations
- API: Express 5 (admin login/verify endpoints)
- DB/Content: Supabase (PostgreSQL hosted externally) — articles, categories, images
- Fonts: Google Fonts (Tajawal, Alexandria, Space Grotesk, Fira Code, Playfair Display)
- RTL: Full Arabic right-to-left layout

## Where things live

- `artifacts/tech-start/src/` — frontend source
- `artifacts/tech-start/src/components/` — page section components (Navbar, Footer, HeroSection, etc.)
- `artifacts/tech-start/src/lib/supabase.ts` — Supabase client + all DB queries
- `artifacts/tech-start/src/lib/router.ts` — custom hash-free SPA router
- `artifacts/tech-start/src/data/aiTools.ts` — static AI tools catalog
- `artifacts/tech-start/src/types.ts` — Article, Category, AiTool types
- `artifacts/api-server/src/routes/admin.ts` — admin login/verify Express routes

## Architecture decisions

- Uses a custom SPA router (pushState) instead of React Router / wouter — preserves original routing logic
- Supabase is used as the primary content database; no Replit Postgres schema for articles/categories
- Admin auth uses a simple token in localStorage (original pattern preserved during migration)
- AI tools data is static (hardcoded in `aiTools.ts`), not stored in the DB
- Tailwind v4 with `@theme` CSS variables for custom fonts; no tailwind.config.ts needed

## Product

- Home page: hero, category nav, featured articles, latest articles, AI tools directory
- Article pages: full content viewer with rich HTML rendering
- Category pages: filtered article listings
- AI tools: directory with tool detail pages
- Admin dashboard: full CRUD for articles, categories, tools with image upload to Supabase Storage

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Supabase credentials are hardcoded as fallbacks in `src/lib/supabase.ts` — set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Replit secrets to override
- `NEXT_PUBLIC_*` env var names in the original code were kept as secondary fallbacks; primary is `VITE_*`
- The admin token is a static string — not production-safe; replace before deploying to production

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
