/* Shared domain types for the SEC platform (dummy-data edition).
   Every entity that would live in the database is described here. */

export type Lang = "en" | "es";

export type Role = "student" | "teacher" | "reviewer" | "partner" | "admin";

export type Region = "Africa" | "Asia" | "Latin America" | "Mesoamerica" | "Europe";

export type MilestoneStatus = "locked" | "open" | "draft" | "awaiting_teacher" | "submitted" | "reviewed" | "returned";

/** What a milestone accepts as evidence. */
export type SubmissionKind = "image" | "document" | "video";

/** A file attached to a draft or submission (thumbs stored as data URLs for the demo). */
export interface SubFile {
  id: string;
  name: string;
  kind: SubmissionKind;
  size: number;          // bytes AFTER client-side compression
  origSize?: number;     // bytes before compression (images only)
  thumb?: string;        // small data-URL thumbnail (images only)
}

/** Autosaved work-in-progress for one team + milestone. */
export interface SubmissionDraft {
  text: string;
  attachments: SubFile[];
  savedAt: string; // ISO
}

export interface LocalText { en: string; es: string }

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  country: string;
  school?: string;
  partnerId?: string;
  hue: number; // avatar palette seed
}

/** One rubric criterion, localized — set per milestone by admins. */
export interface RubricCriterion {
  id: string;
  labels: LocalText;
}

/** Configuration of one programme milestone (editable & reorderable by admins). */
export interface MilestoneCfg {
  id: number; // stable identity — display order comes from the array order
  name: LocalText;
  blurb: LocalText;
  guidance: LocalText;   // step-by-step help shown to the team
  video?: string;        // optional guidance video link
  accepts: SubmissionKind[]; // required submission types
  rubric: RubricCriterion[]; // scoring criteria judges use on this milestone
  due: string; // ISO date
  points: number;
  open: boolean;
}

/** One scoring event — history is APPEND-ONLY, never overwritten (audit trail). */
export interface ScoreEvent {
  id: string;
  at: string;          // ISO date
  by: string;          // reviewer name
  decision: "approved" | "returned";
  total: number;       // 0-100
  criteria: number[];  // one per rubric criterion at the time
  feedback: string;
}

/** A team's progress on a single milestone. */
export interface MilestoneProgress {
  status: MilestoneStatus;
  fileName?: string;
  files?: SubFile[];
  answer?: string;
  submittedAt?: string;
  score?: number; // 0-100
  criteria?: number[]; // 5 scores 0-10
  feedback?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  consent: boolean; // guardian consent flag — safeguarding
}

export interface Team {
  id: string;
  name: string;
  school: string;
  country: string;
  code: string; // country code chip e.g. "KE"
  region: Region;
  partnerId: string;
  teacherName: string;
  stage: number; // furthest open milestone index
  points: number;
  members: TeamMember[];
  progress: Record<number, MilestoneProgress>;
  hue: number;
}

export interface Submission {
  id: string;
  teamId: string;
  teamName: string;
  school: string;
  country: string;
  milestone: number;
  fileName: string;
  files?: SubFile[];
  answer?: string;
  submittedAt: string;
  status: "pending" | "approved" | "returned";
  assignee?: string;      // reviewer this is assigned to (region/language/manual)
  reviewedAt?: string;    // for turnaround-time monitoring
  criteria?: number[];    // latest round
  score?: number;         // latest round
  feedback?: string;      // latest round
  history?: ScoreEvent[]; // full audit trail — append only
}

/** Event that triggers an automatic message (5.6). */
export type MessageEvent =
  | "welcome" | "deadline_7" | "deadline_1" | "submission_received"
  | "feedback_ready" | "returned" | "reengage" | "manual";

export type MsgChannel = "email" | "whatsapp";

/** An editable message template, localized in every supported language. */
export interface MessageTemplate {
  id: string;
  event: MessageEvent;
  subject: LocalText;
  body: LocalText;
  channels: MsgChannel[];
  enabled: boolean;
}

/** One message that was actually sent — kept forever against the user/team. */
export interface Delivery {
  id: string;
  to: string;          // user or team name
  channel: MsgChannel;
  event: MessageEvent;
  preview: string;     // subject + body at send time (audit)
  at: string;          // ISO string or "queued"
  status: "sent" | "queued";
}

export interface Message {
  id: string;
  author: string;
  body: string;
  at: string;
  mine?: boolean;
}

export interface Thread {
  id: string;
  title: string;
  subtitle: string;
  hue: number;
  unread: number;
  messages: Message[];
}

export type NotificationKind = "award" | "info" | "alert";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  kind: NotificationKind;
}

export interface Resource {
  id: string;
  title: string;
  cat: "Guides" | "Templates" | "Finance" | "Marketing" | "Videos";
  lang: "EN" | "ES" | "EN + ES";
  size: string;
  desc: string;
  body: string; // preview content
}

export interface PartnerOrg {
  id: string;
  name: string;
  country: string;
  code: string;
  region: Region;
  schools: number;
  teams: number;
  contact: string;
  active: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  country: string;
  status: "active" | "suspended";
  joined: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  at: string;
  audience: "all" | "teachers" | "judges";
}

export interface ToastMsg {
  id: string;
  title: string;
  body?: string;
  kind: "success" | "info" | "error";
}

/** A message flagged for the safeguarding team (users are minors). */
export interface FlagItem {
  id: string;
  threadId: string;
  threadTitle: string;
  author: string;
  body: string;
  reporter: string;
  at: string;
  resolved: boolean;
}

export const MILESTONE_KEYS = ["registration", "idea", "plan", "actuals", "report"] as const;

export const RUBRIC_KEYS = ["research", "innovation", "feasibility", "finance", "presentation"] as const;
