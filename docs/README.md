# School Enterprise Challenge (SEC) Platform — Developer Guide

This folder explains how the platform is put together **in plain English**, so that
a small non-technical team (with AI coding tools) can maintain it confidently.

| Document | What it covers |
| --- | --- |
| `/README.md` (repo root) | What the project is, how to run and deploy it |
| `architecture.md` | How the pieces fit together, written for non-developers |
| `how-to-guides/add-a-language.md` | Adding a third (or fourth) UI language |
| `how-to-guides/edit-a-milestone.md` | Editing/reordering milestones, rubrics, deadlines |
| `how-to-guides/add-a-reviewer.md` | Creating judges, assigning work, checking fairness |
| `/PROJECT.md` (repo root) | Client-facing summary: client, qualities, features, stack |
| `/.env.example` (repo root) | Every environment variable, with plain descriptions |

---

## 1. What this build is (and is not)

This repository contains a **fully-working front-end demo** of the SEC platform.
Every screen, button and flow works, but instead of a real database the app uses a
**dummy-data engine** (`src/lib/mock.ts`) and stores all changes in the browser's
`localStorage`. That means:

- No server or database is needed to run the demo.
- Data survives page reloads on the same device (and can be wiped in
  *Settings → Delete my data*).
- Going to production is a well-defined swap (see Section 6).

## 2a. Recommended production stack (from the charity) & our deviations

| Charity recommendation | This demo | Production plan |
| --- | --- | --- |
| Next.js (React) frontend | ✅ used | keep |
| Capacitor mobile wrapper | documented (Section 7) | wrap the same codebase |
| Tailwind CSS | ✅ used | keep |
| REST/tRPC API inside Next.js | not needed for demo | add route handlers under `src/app/api/` — action shapes in `store.tsx` map 1:1 to endpoints |
| PostgreSQL (Supabase/Railway) via SQL | **deviation: no DB** per the brief — dummy data + `localStorage` instead | Drizzle tables matching `src/lib/types.ts` one-to-one |
| S3-compatible file storage | **deviation:** files are captured in-browser; images are really compressed (canvas) and kept as tiny data-URL thumbnails | presigned uploads to S3/R2; store only the URL |
| Managed auth (email + WhatsApp/SMS OTP) | **deviation:** one-tap demo personas | Supabase Auth / Clerk with email links; WhatsApp OTP via the provider's SMS hook |
| i18next / Next i18n JSON strings | **deviation:** typed dictionaries exported from `src/lib/i18n.ts` (same discipline — zero hardcoded UI strings) | moving the `Dict` object into per-locale JSON files takes minutes |
| WhatsApp Business API + SendGrid reminders | **deviation:** simulated (welcome message appears as thread + notification) | queue `RECEIVE_MESSAGE`/notification writes from a server-side worker |
| Vercel + managed Postgres hosting | runs anywhere | unchanged |

Every deviation exists **only** because this build must run with dummy data and no
database. The boundaries were drawn exactly where the production services would
plug in, so the swap is mechanical (see Section 6).

## 2b. Phase 1 features delivered (sections 5.1–5.3 of the brief)

- **5.1 Sign-up & onboarding** — `/signup`: 4-step wizard (teacher details →
  confirm school → create first team → invite students). Email **or** WhatsApp
  contact choice decides the welcome channel (simulated modal + support message).
  Fuzzy **duplicate-school detection** matches input against
  `EXISTING_SCHOOLS` in `mock.ts` (exact or substring match) and asks whether
  they are the same school — one school, one record.
- **5.2 Milestone journey as data** — `MilestoneCfg` holds name (EN/ES), blurb,
  guidance, video link, accepted evidence types, deadline, points and open flag.
  **Admin → Programme** edits names/guidance/points/deadlines, toggles openness
  and **reorders** milestones (`MOVE_MILESTONE` — no code change needed). The
  student's Journey page is led by a **horizontal progress stepper**; future
  milestones are visible but locked.
- **5.3 Submissions** — written answers + photos/documents per milestone.
  Drafts **autosave** every 700 ms into `state.drafts` (survives reloads and
  connection drops). Images go through `compressImage()` (canvas, ≤480px,
  ~60% quality) before upload and show "2.4 MB → compressed" savings. The
  status ladder is enforced: *Not started → Draft saved → Submitted → Under
  review → Reviewed*; judges can **return** work and teams can resubmit.
- **"Where am I, what next?" dashboards** — every role's home answers this the
  named-requirement way: a `nextActionFor()` helper computes the literal next
  sentence per team ("Finish your Business Plan draft", "Revise … per judge
  feedback") and judges/partners/admins get the equivalent queue/backlog nudge
  (partner home includes an **at-risk teams** radar).
- **5.8 One set of school records** — **Admin → Schools** folds all 2,400 teams
  into a deduplicated directory, flags possible duplicates (same school with
  multiple contacts/partners) and offers a one-click **Consolidate** merge.
- **Section 10 safeguarding** — any chat message can be **flagged** (touch and
  desktop affordances); flags land in **Admin → Safety** with a 24-hour review
  policy banner and resolve action. Auto-moderation seeds one example flag.
  Consent switches per minor (Team page) and name-free exports (Reports) remain
  enforced platform-wide.
- **Offline resilience** — a `useOnline()` banner tells users on dead
  connections that drafts keep saving locally; all state (drafts, submissions,
  scores) already persists in `localStorage`.
- **Installable today** — `src/app/manifest.ts` + `src/app/icon.svg` give the
  platform PWA installability, so users can "Add to home screen" long before the
  Capacitor store build.
- **5.4 Review & judging** — submissions carry an `assignee` (auto-assigned by
  region from `REVIEWERS`, re-assignable in **Admin → Review**); every milestone
  owns an editable rubric; judges score with a "Assigned to me" queue filter; and
  **every scoring round is appended to an immutable audit trail** (`ScoreEvent[]`)
  visible to judges and teams.
- **5.6 Event-driven messaging** — `welcome`, `deadline_7`/`_1`,
  `submission_received`, `feedback_ready`, `returned`, `reengage` are coded
  events: each has an EN/ES template with per-channel routes (email/WhatsApp),
  and **every send is written to the delivery log** (Admin → Messaging shows
  templates, full history, and manual targeted sends such as "all inactive teams
  in Kenya"). Signing up or submitting evidence triggers real log entries.
- **Section 6 admin depth** — People tab now creates staff/reviewer accounts;
  Review tab shows per-judge workload + turnaround and rubric editing per
  milestone per language; Reports tab exports are filterable by country,
  partner and milestone stage (no more spreadsheet merging); Schools tab keeps
  the one-record-per-school rule enforced.

## 2. Technology choices (and why)

| Choice | Why |
| --- | --- |
| **Next.js (App Router)** | One framework for the marketing site + app + future API. Each page ships only the JavaScript it needs — important on slow 3G. |
| **Tailwind CSS v4** | Utility classes keep styles consistent and tiny. The whole look is defined in one file: `src/app/globals.css`. |
| **Plain SVG charts** (`src/components/charts.tsx`) | No chart library = ~40 kB saved. Charts are simple functions, easy to extend. |
| **lucide-react** | A consistent icon set. Never use emojis in the UI. |
| **localStorage persistence** | Behaves like a tiny on-device database; also proves the state shape is serialisable (a precondition for any real API). |

## 3. File map

```
src/
├─ app/
│  ├─ page.tsx            # Public marketing site (hero, journey, stories…)
│  ├─ login/page.tsx      # Sign-in: one-tap demo personas + classic form
│  ├─ signup/page.tsx     # Teacher registration + 4-step onboarding wizard
│  └─ app/                # The signed-in platform (inside AppShell)
│     ├─ layout.tsx       # Wraps everything below in the shell
│     ├─ page.tsx         # Home dashboard (different per role)
│     ├─ journey/         # Teacher/student: 5 milestones, uploads, feedback
│     ├─ team/            # Teacher/student: roster, consent, invite code
│     ├─ review/          # Judge: scoring queue with rubric sliders
│     ├─ partner/         # Partner org: KPIs, filters, CSV export
│     ├─ admin/           # TAMTF: overview, people, partners, programme,
│     │                   #        announcements, reports
│     ├─ resources/       # Library with preview + download
│     ├─ messages/        # Chat with safeguarding banner
│     └─ settings/        # Profile, language, privacy, session
├─ components/
│  ├─ ui.tsx              # Buttons, cards, modals, pills, toasts, forms…
│  ├─ charts.tsx          # Donut, Trend, Bars (pure SVG)
│  └─ shell.tsx           # Sidebar/topbar/bottom-nav, notifications, search
└─ lib/
   ├─ types.ts            # Every entity's TypeScript shape (start here!)
   ├─ i18n.ts             # ALL translation strings (EN + ES)
   ├─ mock.ts             # Deterministic dummy-data generator (61 countries,
   │                      # 12 partners, 2,400 teams, review queue, chats…)
   ├─ store.tsx           # The app store: state + actions + persistence
   └─ utils.ts            # CSV/blob downloads, formatting helpers
```

## 4. How data flows

1. `mock.ts` builds the initial world (seeded RNG → identical everywhere).
2. `store.tsx` holds that world in React state and **saves every change to
   `localStorage`** under the key `sec-demo-v2`.
3. Pages never mutate data directly — they dispatch **actions**
   (`SUBMIT_EVIDENCE`, `SCORE_SUBMISSION`, `SEND_MESSAGE`, `ADD_MEMBER`,
   `UPDATE_MILESTONE`, `ADD_ANNOUNCEMENT`, …). The reducer in `store.tsx`
   is the single place where rules live.
4. Toasts and notifications are part of the same store, so every action can
   be confirmed to the user.

**The demo loop that proves it:** sign in as *Amara (Teacher)* → Journey shows
"Business Plan — Under review". Switch account → sign in as *Carlos (Judge)* →
Review queue contains Sunrise Juice Co.'s plan → score & approve → switch back
to Amara: the milestone now shows the score, rubric bars and feedback, and the
notification bell has a new award.

## 5. Adding a new language

Translations are **pure data** in `src/lib/i18n.ts`:

1. Copy the `en` object, rename it (e.g. `fr`), translate the values.
2. Add it to `STRINGS` (`{ en, es, fr }`).
3. Add `{ id: "fr", label: "Français", short: "FR" }` to `LANGS`.

That's it — the language switcher appears everywhere automatically.
When a key is missing in a language, the app silently falls back to English.
Milestone names/descriptions are *content* (editable by admins in
**Admin → Programme**) and are stored per language already.

## 6. Going to production (swap dummy → real backend)

The code was carefully shaped so the swap touches few files:

1. **Database**: `src/db/schema.ts` (Drizzle) already exists; model tables to
   match `src/lib/types.ts` 1:1 (`users`, `teams`, `milestones`,
   `submissions`, `threads`, `messages`, `notifications`, `partners`…).
2. **API**: create route handlers under `src/app/api/` that return exactly the
   shapes in `types.ts`.
3. **Store**: in `store.tsx`, replace `freshState()` with fetches from the API,
   and make each action `POST`/`PATCH` first, then update state. The reducer
   logic (rules) stays identical.
4. **Uploads**: replace the fake file-name capture in `journey/page.tsx` with a
   presigned-URL upload (S3/R2). Keep the 25 MB limit and mime whitelist.
5. **Auth**: replace the persona picker with real auth (e.g. Auth.js with
   email codes — SMS/email OTPs work better than passwords on shared phones).

Designed-for scale assumptions: index `teams(country)`, `teams(partnerId)`,
`submissions(status)`; paginate tables (the partner/admin lists already
paginate); serve images through a CDN with `auto=compress` (the demo's
Pexels URLs use exactly this pattern).

## 7. Wrapping as a mobile app

The web app is fully responsive (360 px first), so an app-store build is a
**wrapper, not a rewrite**:

1. `npm install @capacitor/core @capacitor/cli` and `npx cap init`.
2. `npx cap add android` / `npx cap add ios`.
3. Point the wrapper at the deployed URL (or bundle the static export).
4. Use Capacitor plugins for push notifications and the camera (the file
   input already accepts camera captures on mobile browsers).

## 8. Data protection & safeguarding (non-negotiables)

- **First names + initial only** — never store or show student surnames.
- Guardian-consent flags per member (Team page); reports exclude names.
- Messaging shows a permanent "monitored" banner; keep the moderation path
  wired to `safeguarding@teachamantofish.org.uk`.
- "Export my data" / "Delete my data" (Settings) satisfy GDPR-style rights;
  keep equivalents in the production backend.
- Shared devices: one-tap *Switch account* from the avatar menu and Settings.

## 9. Performance checklist (slow-internet rules)

- Pages are client-rendered and cached; keep new pages **below ~60 kB** of JS.
- Always `loading="lazy"` on below-the-fold images; `auto=compress` on URLs.
- Always show a skeleton/loading panel instead of a blank screen (the shell
  already does this during hydration).
- Do not add heavy dependencies without checking bundle impact
  (`npm run build` prints per-page sizes).
