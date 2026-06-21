# Tech Radar — Agent Guide

Self-hosted tech radar: track technologies across four quadrants (Techniques,
Tools, Platforms, Languages & Frameworks) and four rings (Adopt, Trial, Assess,
Hold). One radar per instance, no auth (operators secure it at the proxy layer).

## Stack
- **Nuxt 4** (TypeScript, `compatibilityVersion: 4`; app code in `app/`)
- **Prisma 6** + **SQLite** (`prisma/schema.prisma`, DB via `DATABASE_URL`)
- **TanStack Vue Query** (data layer), **vee-validate + zod** (forms/validation)
- **Tailwind v4** + **shadcn-vue/reka-ui**, **motion-v** (animation)
- **pnpm**

## Layout
- `app/pages` — `index.vue` (radar), `review.vue`, `setup.vue` (onboarding)
- `app/components/radar/*` — radar SVG, blip dots, detail panel, sidebar, add/edit sheet
- `app/composables/*` — `useBlips`, `useSettings`, `useRadarView` (pan/zoom), `useCommandPalette`, `useToast`
- `server/api/*` — Nitro handlers; import `prisma` directly, respond `{ data }` / throw via `fail()`
- `shared/*` — `lib/radar` (pure positioning/review math + constants), `validations`, `types` (alias `#shared`)

## Commands
- `pnpm dev` · `pnpm build` · `pnpm test` (Vitest) · `pnpm db:migrate`

## Conventions
- Keep it readable for someone who knows Vue but not this codebase.
- Quadrant/ring taxonomy is fixed — never make it configurable.
- Route handlers use `prisma` directly (no abstraction layer).
- Selection/focus state lives in the URL where useful (`?blip=<number>`, short, no UIDs).

## Icons — use Phosphor via `@nuxt/icon`
- Use `<Icon name="ph:<name>" class="h-4 w-4" />`. **Do not hand-roll `<svg>` icons.**
- Only a small subset of Phosphor is bundled (offline). When you use a **new**
  icon, add its `ph:<name>` to `USED_ICONS` in `nuxt.config.ts` (it feeds both
  the server subset collection and the client bundle) — otherwise it won't render.
- The `<svg>` in `Radar.vue` (the radar chart) and `setup.vue` (decorative
  background) are graphics, not icons — leave them.

## Git
- Never add a `Co-Authored-By` trailer to commits.
- Never commit without the user's explicit approval.
