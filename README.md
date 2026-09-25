# School Enterprise Challenge (SEC) Platform

A full-stack web platform for **Teach A Man To Fish (TAMTF)** that runs the global
School Enterprise Challenge: 60,000+ students in 60+ countries plan, launch and
run a real mini-enterprise, submit evidence at five milestones, and get scored by
global judges.

**This build runs on deterministic dummy data — no database or external services
are required to explore every feature.** User changes (drafts, scores, settings)
persist in the browser via `localStorage`.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Production check:

```bash
npm run build
npm start
```

## Where to click first

1. `/` — marketing site. Switch language (EN/ES) top-right.
2. `Join the challenge` → `/signup` — 4-step teacher onboarding wizard.
3. `/login` — one-tap **demo personas** for all five roles:
   Teacher (Amara, Kenya) · Student (Amina) · Judge (Carlos, Honduras) ·
   Partner staff (Lucía) · TAMTF admin (Priya).
4. Try the full loop: sign in as the **teacher** → Journey shows a submitted
   plan → switch account → sign in as the **judge** → score it → switch back and
   see the score, rubric, feedback and notification.

## Project layout

| Path | What it is |
| --- | --- |
| `src/app/` | Marketing site, login, signup wizard, and the `/app` platform (8 workspaces) |
| `src/components/` | Shared UI kit, shell (sidebar/bottom-nav), SVG charts |
| `src/lib/` | `types.ts` (every entity), `i18n.ts` (all UI strings), `store.tsx` (state + actions), `mock.ts` (seeded dummy data), `utils.ts` |
| `src/db/schema.ts` | Production relational schema (Drizzle) — ready for Postgres |
| `docs/` | Architecture guide + how-to guides for non-developers |
| `PROJECT.md` | Client-facing product summary, qualities and tech stack |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript check |

## Security & safety notes (demo)

- All data stays on the device; "Delete my data" in Settings wipes it.
- Safeguarding flows are fully exercised: chat flagging → Admin → Safety queue,
  teacher approval of student submissions, consent tracking, name-free exports.
- Production security design is documented in `docs/architecture.md`.
