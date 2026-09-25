/* PRODUCTION DATABASE SCHEMA (Section 9) — designed now, activated later.
 *
 * The demo runs on local dummy data (no database), but this schema shows the
 * exact relational model the platform is built against. Highlights:
 *  - ONE record per Person / School — shared across current AND future TAMTF
 *    programmes (roles live on memberships, not on the person).
 *  - Programme cycle per year, so past years are never overwritten.
 *  - Reviews are append-only rows (audit trail), never updates.
 *  - Every message ever sent is a message_logs row (Section 5.6).
 *
 * When the team is ready to go live: `npx drizzle-kit push` applies this file
 * to a managed Postgres (Supabase/Railway) as-is.
 */

import {
  pgEnum, pgTable, uuid, text, varchar, integer, smallint, boolean,
  timestamp, date, uniqueIndex,
} from "drizzle-orm/pg-core";

/* ---------- enums ---------- */
export const channelEnum = pgEnum("channel", ["email", "whatsapp", "push"]);
export const roleEnum = pgEnum("site_role", ["student", "teacher", "reviewer", "partner", "admin"]);
export const submissionStatusEnum = pgEnum("submission_status", [
  "awaiting_teacher", // student work waiting for the teacher's approval (Section 10)
  "submitted",
  "under_review",
  "returned",
  "reviewed",
]);
export const reviewDecisionEnum = pgEnum("review_decision", ["approved", "returned"]);

/* ---------- partner organisations (scoped access to countries/schools) ---------- */
export const partnerOrgs = pgTable("partner_orgs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  /** countries this partner may see — scoping rule for partner dashboards */
  countries: text("countries").array().notNull(),
  contactPersonId: uuid("contact_person_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------- ONE record per human, regardless of role ---------- */
export const persons = pgTable("persons", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** safeguarding: first name + initial only for minors — never a surname */
  displayName: varchar("display_name", { length: 120 }).notNull(),
  email: varchar("email", { length: 200 }),                 // encrypted at rest in production
  phoneHash: text("phone_hash"),                            // only a hash is stored
  country: varchar("country", { length: 80 }).notNull(),
  locale: varchar("locale", { length: 8 }).notNull().default("en"),
  ageBand: varchar("age_band", { length: 8 }),              // "13-15" etc — data minimisation: no birthdates
  guardianConsent: boolean("guardian_consent").notNull().default(false),
  suspended: boolean("suspended").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** A person can hold different roles in different programme cycles —
 *  never create a second Person row when their role changes. */
export const memberships = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id").notNull().references(() => persons.id, { onDelete: "cascade" }),
  role: roleEnum("role").notNull(),
  partnerOrgId: uuid("partner_org_id").references(() => partnerOrgs.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("memberships_person_role_partner").on(t.personId, t.role, t.partnerOrgId)]);

/* ---------- ONE record per school (5.8) ---------- */
export const schools = pgTable("schools", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  country: varchar("country", { length: 80 }).notNull(),
  partnerOrgId: uuid("partner_org_id").references(() => partnerOrgs.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("schools_name_country").on(t.name, t.country)]); // dedup rule

/* ---------- programme cycles (one per year — history is never overwritten) ---------- */
export const programmeCycles = pgTable("programme_cycles", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 20 }).notNull().unique(), // e.g. "sec-2025-26"
  name: varchar("name", { length: 160 }).notNull(),
  startsOn: date("starts_on").notNull(),
  endsOn: date("ends_on").notNull(),
});

/* ---------- milestones are data, ordered per cycle ---------- */
export const milestones = pgTable("milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  cycleId: uuid("cycle_id").notNull().references(() => programmeCycles.id, { onDelete: "cascade" }),
  position: smallint("position").notNull(),          // ordered — admin reorderable
  /** content is stored per language in milestone_translations below */
  dueAt: timestamp("due_at", { withTimezone: true }),
  points: smallint("points").notNull().default(100),
  accepts: text("accepts").array().notNull(),        // ["image","document","video"]
  open: boolean("open").notNull().default(true),
});
export const milestoneTranslations = pgTable("milestone_translations", {
  id: uuid("id").primaryKey().defaultRandom(),
  milestoneId: uuid("milestone_id").notNull().references(() => milestones.id, { onDelete: "cascade" }),
  locale: varchar("locale", { length: 8 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  blurb: text("blurb"),
  guidance: text("guidance"),
  videoUrl: text("video_url"),
  rubricJson: text("rubric_json").notNull(),          // [{id, labels:{en,es}}, …]
}, (t) => [uniqueIndex("milestone_locale").on(t.milestoneId, t.locale)]);

/* ---------- teams: one school + one cycle ---------- */
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolId: uuid("school_id").notNull().references(() => schools.id),
  cycleId: uuid("cycle_id").notNull().references(() => programmeCycles.id),
  name: varchar("name", { length: 160 }).notNull(),
  teacherLeadId: uuid("teacher_lead_id").notNull().references(() => persons.id),
  stage: smallint("stage").notNull().default(0),
  points: integer("points").notNull().default(0),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }), // drives at-risk flags
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("teams_school_cycle_name").on(t.schoolId, t.cycleId, t.name)]);

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  personId: uuid("person_id").notNull().references(() => persons.id),
  role: varchar("role", { length: 60 }), // Team Captain, Finance Lead…
}, (t) => [uniqueIndex("team_member_unique").on(t.teamId, t.personId)]);

/* ---------- submissions + reviews (append-only audit) ---------- */
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull().references(() => teams.id),
  milestoneId: uuid("milestone_id").notNull().references(() => milestones.id),
  status: submissionStatusEnum("status").notNull().default("submitted"),
  answer: text("answer"),                            // free-text part (moderated)
  submittedById: uuid("submitted_by_id").notNull().references(() => persons.id),
  approvedByTeacherAt: timestamp("approved_by_teacher_at", { withTimezone: true }),
  assigneeId: uuid("assignee_id").references(() => persons.id), // assigned reviewer
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});
export const submissionFiles = pgTable("submission_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
  kind: varchar("kind", { length: 12 }).notNull(),   // image | document | video
  storageKey: text("storage_key").notNull(),         // S3/R2 object key
  originalName: varchar("original_name", { length: 240 }),
  bytes: integer("bytes"),
});
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").notNull().references(() => submissions.id),
  reviewerId: uuid("reviewer_id").notNull().references(() => persons.id),
  decision: reviewDecisionEnum("decision").notNull(),
  total: smallint("total").notNull(),                // 0-100
  criteriaJson: text("criteria_json").notNull(),     // scores at that moment — never edited
  feedback: text("feedback"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // NOTE: no UPDATE path — scoring again inserts a new row (audit trail, 5.4)
});

/* ---------- message log: every message ever sent, per person (5.6) ---------- */
export const messageLogs = pgTable("message_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id").references(() => persons.id),
  teamId: uuid("team_id").references(() => teams.id),
  channel: channelEnum("channel").notNull(),
  event: varchar("event", { length: 40 }).notNull(), // welcome | deadline_7 | …
  subject: text("subject"),
  body: text("body"),
  status: varchar("status", { length: 12 }).notNull().default("sent"), // sent | queued | failed
  sentAt: timestamp("sent_at", { withTimezone: true }),
});
export const messageTemplates = pgTable("message_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  event: varchar("event", { length: 40 }).notNull(),
  locale: varchar("locale", { length: 8 }).notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  channels: text("channels").array().notNull(),
  enabled: boolean("enabled").notNull().default(true),
}, (t) => [uniqueIndex("template_event_locale").on(t.event, t.locale)]);

/* ---------- safeguarding moderation (Section 10) ---------- */
export const moderationFlags = pgTable("moderation_flags", {
  id: uuid("id").primaryKey().defaultRandom(),
  flaggedById: uuid("flagged_by_id").references(() => persons.id),
  contentRef: text("content_ref").notNull(),          // e.g. "message:<id>" / "submission:<id>"
  excerpt: text("excerpt"),
  reason: varchar("reason", { length: 40 }),          // auto_profanity | user_report
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolvedById: uuid("resolved_by_id").references(() => persons.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
