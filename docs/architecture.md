# Architecture — in plain English

> Audience: a smart non-developer, possibly working with an AI coding assistant.
> Every box below explains *what it does* and *why it exists*.

## The big picture

```
                      ┌──────────────────────────────┐
   Teacher / Student  │                              │
   Judge / Partner    │   Next.js web application     │
   TAMTF admin        │   (the only codebase)         │
                      │                              │
   mobile browsers →  │  Marketing site · Login ·     │
   wrapped mobile app │  8 role-based workspaces      │
                      └───────┬──────────────────────┘
                              │ one shared state+action layer (store.tsx)
              ┌───────────────┼────────────────────────┐
              ▼               ▼                        ▼
     ┌─────────────────┐ ┌──────────────┐ ┌────────────────────────┐
     | PostgreSQL      │ | Object store │ | Messaging providers    │
     | (Supabase/      │ | (S3/R2):     │ | SendGrid (email) +     │
     |  Railway)       │ | evidence     │ | WhatsApp Business API  │
     | the schema in   │ | files        │ | (notifications)        │
     | src/db/schema.ts│ |              │ |                        │
     └─────────────────┘ └──────────────┘ └────────────────────────┘
```

Today only the top box exists; the database/storage/providers are swapped in as
described in `docs/README.md` §6 — the code is already shaped to receive them.

## How the app is organised

1. **Pages** (`src/app/`) — the marketing site and eight workspaces
   (journey, team, review, partner, admin, resources, messages, settings).
   Pages never change data directly; they call *actions*.
2. **The store** (`src/lib/store.tsx`) — the single place that owns all data
   and all rules ("a judge's score is appended to history", "student work waits
   for teacher approval"). In production this becomes API calls; the rules move
   to Next.js route handlers unchanged.
3. **Types** (`src/lib/types.ts`) — the dictionary of every entity. The
   production Drizzle schema (`src/db/schema.ts`) mirrors it, so reporting is
   simple SQL with clear foreign keys.
4. **Translations** (`src/lib/i18n.ts`) — every UI string, keyed by code, in
   two languages. New language = new dictionary object (see how-to guide).
5. **Dummy data** (`src/lib/mock.ts`) — a *seeded* generator: 61 countries,
   12 partner orgs, 2,408 teams, a review queue, message templates and a
   delivery log. Seeded means identical on every device, which is exactly what
   you want from a demo.

## The data model (Section 9), in one breath

**Person** and **School** each exist exactly once. A person's *role* lives on a
separate **membership**, so the same human can teach this year and judge next
year without a second account. **Teams** belong to a school *and* a programme
cycle (one cycle per year, so history is never overwritten). **Milestones** are
ordered data rows with per-language content. **Submissions** belong to a
team+milestone; every **review** is an appended row (scores are never edited,
only re-created) which gives TAMTF a full audit trail for free. **Message logs**
sit beside the person, so an admin can see everything that was ever sent to them.

## The messaging system (Section 5.6), in one breath

Something happens (a signup, an upload, a score). The code looks up the
*event* in the templates table (`welcome`, `deadline_7`, …), renders the
subject/body in the user's language, sends it over each enabled channel
(email/WhatsApp), and finally writes the actual message into the **delivery
log** — which is what admins browse in *Admin → Messaging*.

## Safety & privacy by design (Section 10)

- Minors: first name + initial, age band only; no addresses, no photos of faces,
  no surnames anywhere (including CSV exports).
- Students never reach judges directly: their submission is held at
  **awaiting teacher** until the teacher approves or sends it back.
- All free text (chat + submission answers) is scanned by a local moderation
  list; hits land in *Admin → Safety* for a human — nothing is silently deleted.
- GDPR-style rights today: export my data / delete my data in Settings.
- Any future AI feature (translations, assistant answers) must carry a visible
  “AI-generated” label — this is a hard rule in `docs/README.md` §8.

## For 60,000 students tomorrow

- The site is static-prerendered (pages render on any CDN edge, tiny first-load).
- Heaviest lists (2,442 teams) render with pagination and client filtering —
  in production the same shapes become indexed SQL queries
  (`teams(country)`, `submissions(status)`, `message_logs(person_id)`).
- Images are compressed **before** upload in the browser; files would stream
  straight to S3 with presigned URLs, keeping servers out of the data path.
