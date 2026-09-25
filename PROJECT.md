# PROJECT.md — School Enterprise Challenge (SEC) Platform

## Project title

**SEC Platform — the global digital home of the School Enterprise Challenge**

A luxurious, mobile-first, multilingual SaaS platform where school teams across
60+ countries plan, launch and run a *real* mini-enterprise — from first idea to
a judge-scored end-of-year report.

## Client

**Teach A Man To Fish (TAMTF)** — the UK-registered international NGO (charity
No. 1117932) behind the School Enterprise Challenge, which reached **~60,000
students in 60+ countries** last year, delivered jointly with partner
organisations across India, Africa, Asia, Latin America and Mesoamerica.

**Buyer profile:** NGOs, foundations and education networks running large-scale
school programmes who have outgrown no-code tools (this platform replaces
TAMTF's Bubble build) and need an owned, scalable, low-cost-to-maintain system a
tiny non-technical team can run with AI coding assistants.

## What the platform does

Teachers register their school in a 4-step wizard and create student teams.
Teams walk a five-milestone journey — Registration → Business Idea → Business
Plan → Real Money → End of Year Report — with autosaving drafts, photo/document
evidence uploads (images compressed in the browser for 3G), and plain-language
"what to do next" guidance on every screen. Judges score submissions against
per-milestone rubrics with append-only audit trails; partner organisations track
hundreds of teams in real time; and TAMTF admins run the entire programme —
people, schools, milestones, rubrics, messaging templates, safeguarding and
filtered CSV exports — from one dense admin panel.

## Qualities (why this build stands out)

- **Mobile-first by law:** 360px is the base layout; desktop is a bonus.
  Bottom-tab navigation, thumb-reach controls, offline banner, tiny clean pages.
- **Works on patchy 3G:** drafts autosave every 700ms into local storage;
  images shrink from ~4 MB to ~30 KB client-side; clear loading states;
  everything keeps working offline and persists across reloads.
- **Genuinely multilingual:** 100% of UI text lives in keyed translation
  dictionaries (English + Spanish today; a new language is a data copy, not code).
- **Safe for minors:** teacher-approval gate before judging, guardian-consent
  tracking, monitored messaging with a report button, auto-moderation queue,
  first-name-only data, export/delete-my-data rights.
- **"Ours to run":** every programme element (milestones, rubrics, deadlines,
  templates) is editable in admin without a developer; /docs explains everything
  in plain English to a non-technical team.
- **Luxurious feel, charitable soul:** editorial serif/gold design system,
  physics-eased animations, seeded data that makes every demo look real.
- **Audit-grade integrity:** scoring history is append-only; every message ever
  sent is logged against its recipient.

## Feature inventory

| Area | Highlights |
| --- | --- |
| Marketing site | Animated hero, journey, impact counters, stories, role bento — fully localized |
| Onboarding | 4-step teacher wizard, school duplicate detection, email/WhatsApp welcome |
| Team journey | Prominent stepper, guidance per milestone, templates, uploads, resubmission |
| Judging | Assigned queue, per-milestone rubric sliders, feedback, audit trail |
| Partner portal | Region-scoped KPIs, trends, at-risk radar, CSV export, drill-downs |
| Admin panel | 10 tabs: overview, people (staff creation), schools (dedup/merge), partners, programme (edit/reorder), review mgmt (assignment, turnaround, rubrics), messaging (templates, full delivery history, targeted sends), announcements, reports, safety queue |
| Messaging | Event-driven (welcome, deadline, receipt, feedback, re-engage) over email + WhatsApp, full history, manual group sends |
| Governance | Safeguarding moderation, consent flows, GDPR export/delete, minimal data |
| Platform | EN/ES everywhere, PWA installable, offline-resilient, seeded deterministic demo data |

## Tech stack

**Application (built and running in this repo):**
Next.js 16 (App Router, TypeScript) · React 19 · Tailwind CSS v4 ·
Framer Motion (animation) · lucide-react (icons) · hand-rolled SVG charts ·
localStorage persistence (dummy-data demo, deterministic seed).

**Designed-for production (schema and docs included, activation documented):**
PostgreSQL via Drizzle ORM (full relational schema in `src/db/schema.ts` —
hosted on Supabase/Railway) · REST API as Next.js route handlers · S3-compatible
object storage for evidence · managed auth with email + WhatsApp/SMS OTP ·
SendGrid + WhatsApp Business API for messaging · Vercel hosting ·
Capacitor wrapper for iOS/Android store listings (PWA manifest already live).

## Status

All Phase 1 scope implemented and verified (type-check, production build, health
check). Phase 2 candidates are scoped in `docs/README.md` §2a (direct student
accounts, media submissions with summarization, auto-translation with AI labels,
offline-first sync, gamification bands, enterprise insight reporting).
