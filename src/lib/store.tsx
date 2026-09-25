"use client";

/* The app store — replaces the backend for this demo build.
   - One source of truth for the whole platform (user, teams, reviews, chats…)
   - Persists to localStorage so work survives reloads and flaky connections
   - A production build would keep these action shapes but call an API instead */

import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type {
  AdminUser, Announcement, AppNotification, Delivery, FlagItem, Lang, MessageEvent,
  MessageTemplate, MilestoneCfg, PartnerOrg, Role, ScoreEvent, SubFile, Submission,
  SubmissionDraft, Team, TeamMember, Thread, ToastMsg, User,
} from "./types";
import { translate } from "./i18n";
import {
  autoAssign, generateTeams, MESSAGE_TEMPLATES, MILESTONES, MY_TEAMS, NOTIFICATIONS, PARTNERS, PERSONAS,
  RESOURCES as _R, SEED_DRAFTS, seedAdminUsers, seedAnnouncements, seedDeliveries, seedSubmissions, THREADS,
} from "./mock";
import { uid } from "./utils";
import type { Resource } from "./types";

export interface Prefs { nEmail: boolean; nAnnounce: boolean; nFeedback: boolean }

export interface AppState {
  hydrated: boolean;
  lang: Lang;
  user: User | null;
  activeTeam: string;
  teams: Team[];
  submissions: Submission[];
  threads: Thread[];
  notifications: AppNotification[];
  adminUsers: AdminUser[];
  partners: PartnerOrg[];
  milestones: MilestoneCfg[];
  announcements: Announcement[];
  resources: Resource[];
  /** autosaved drafts, keyed `${teamId}:${milestoneId}` */
  drafts: Record<string, SubmissionDraft>;
  /** safeguarding moderation queue */
  flags: FlagItem[];
  /** event → automatic message templates (editable, per language) */
  templates: MessageTemplate[];
  /** full delivery history — every message ever sent */
  deliveries: Delivery[];
  prefs: Prefs;
  toasts: ToastMsg[];
}

type Action =
  | { type: "HYDRATE"; payload: AppState }
  | { type: "SET_LANG"; lang: Lang }
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" }
  | { type: "SET_ACTIVE_TEAM"; id: string }
  | { type: "UPDATE_PROFILE"; patch: Partial<User> }
  | { type: "SET_PREF"; key: keyof Prefs; value: boolean }
  | { type: "SAVE_DRAFT"; teamId: string; milestone: number; draft: SubmissionDraft }
  | { type: "SUBMIT_EVIDENCE"; teamId: string; milestone: number; fileName: string; files?: SubFile[]; answer?: string }
  | { type: "CREATE_TEAM"; team: Team; notifTitle: string; notifBody: string }
  | { type: "MOVE_MILESTONE"; id: number; dir: -1 | 1 }
  | { type: "APPROVE_MILESTONE"; teamId: string; milestone: number }
  | { type: "SEND_BACK"; teamId: string; milestone: number; note: string }
  | { type: "SCORE_SUBMISSION"; id: string; criteria: number[]; feedback: string; reviewer: string; decision: "approved" | "returned"; notifTitle: string; notifBody: string }
  | { type: "SEND_MESSAGE"; threadId: string; body: string; at: string }
  | { type: "RECEIVE_MESSAGE"; threadId: string; body: string; author: string; at: string }
  | { type: "MARK_THREAD_READ"; threadId: string }
  | { type: "MARK_ALL_READ" }
  | { type: "TOGGLE_SUSPEND"; userId: string }
  | { type: "UPDATE_MILESTONE"; id: number; patch: Partial<MilestoneCfg> }
  | { type: "ADD_ANNOUNCEMENT"; title: string; body: string; audience: Announcement["audience"]; at: string }
  | { type: "TOGGLE_PARTNER"; id: string }
  | { type: "ADD_MEMBER"; teamId: string; member: TeamMember }
  | { type: "REMOVE_MEMBER"; teamId: string; memberId: string }
  | { type: "TOGGLE_CONSENT"; teamId: string; memberId: string }
  | { type: "SET_MEMBER_ROLE"; teamId: string; memberId: string; role: string }
  | { type: "REPORT_MESSAGE"; threadId: string; threadTitle: string; author: string; body: string; reporter: string; at: string }
  | { type: "RESOLVE_FLAG"; id: string }
  | { type: "MERGE_SCHOOLS"; name: string; country: string }
  | { type: "ASSIGN_SUBMISSION"; id: string; assignee: string }
  | { type: "ADD_STAFF"; staff: AdminUser }
  | { type: "UPDATE_TEMPLATE"; id: string; patch: Partial<MessageTemplate> }
  | { type: "SEND_MANUAL"; templateId: string; subject: string; body: string; channels: ("email" | "whatsapp")[]; country: string; inactiveOnly: boolean; at: string }
  | { type: "PUSH_TOAST"; toast: ToastMsg }
  | { type: "REMOVE_TOAST"; id: string };

const STORAGE_KEY = "sec-demo-v2";

function freshState(): AppState {
  return {
    hydrated: false,
    lang: "en",
    user: null,
    activeTeam: MY_TEAMS[0].id,
    teams: [...MY_TEAMS, ...generateTeams(2400)],
    submissions: seedSubmissions(),
    threads: structuredClone(THREADS),
    notifications: structuredClone(NOTIFICATIONS),
    adminUsers: seedAdminUsers(),
    partners: structuredClone(PARTNERS),
    milestones: structuredClone(MILESTONES),
    announcements: structuredClone(seedAnnouncements),
    resources: structuredClone(_R),
    drafts: structuredClone(SEED_DRAFTS),
    // one seeded safeguard flag so admins can see the queue immediately:
    // auto-moderation caught a student sharing a personal phone number
    flags: [{
      id: "flag-1", threadId: "th-2", threadTitle: "Team Sunrise chat",
      author: "Amina O.", body: "sure, call me on my personal line 0722 555 019 tonight",
      reporter: "Auto-moderation", at: "08:32", resolved: false,
    }],
    templates: structuredClone(MESSAGE_TEMPLATES),
    deliveries: seedDeliveries(),
    prefs: { nEmail: true, nAnnounce: true, nFeedback: true },
    toasts: [],
  };
}

/** Build delivery log entries from a template event (5.6 event → template → channels). */
function deliveriesFor(
  templates: MessageTemplate[], event: MessageEvent, to: string, lang: Lang,
  vars: Record<string, string> = {}, at?: string
): Delivery[] {
  const tpl = templates.find((tp) => tp.event === event);
  if (!tpl || !tpl.enabled) return [];
  const fill = (s: string) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
  return tpl.channels.map((channel) => ({
    id: uid("dl"), to, channel, event,
    preview: `${fill(tpl.subject[lang])} — ${fill(tpl.body[lang])}`,
    at: at ?? new Date().toISOString().slice(0, 16).replace("T", " "),
    status: "sent" as const,
  }));
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return { ...action.payload, hydrated: true, toasts: [] };
    case "SET_LANG":
      return { ...state, lang: action.lang };
    case "LOGIN":
      return { ...state, user: action.user };
    case "LOGOUT":
      return { ...state, user: null };
    case "SET_ACTIVE_TEAM":
      return { ...state, activeTeam: action.id };
    case "UPDATE_PROFILE":
      return { ...state, user: state.user ? { ...state.user, ...action.patch } : null };
    case "SET_PREF":
      return { ...state, prefs: { ...state.prefs, [action.key]: action.value } };

    case "SAVE_DRAFT": {
      const key = `${action.teamId}:${action.milestone}`;
      const empty = !action.draft.text.trim() && action.draft.attachments.length === 0;
      const drafts = { ...state.drafts };
      if (empty) delete drafts[key]; else drafts[key] = action.draft;
      return { ...state, drafts };
    }

    case "SUBMIT_EVIDENCE": {
      const { teamId, milestone, fileName, files, answer } = action;
      const team = state.teams.find((t) => t.id === teamId);
      const drafts = { ...state.drafts };
      delete drafts[`${teamId}:${milestone}`];
      // Section 10: student submissions go to their TEACHER first, not to judges
      const needsApproval = state.user?.role === "student";
      if (needsApproval) {
        return {
          ...state,
          drafts,
          teams: state.teams.map((t) =>
            t.id === teamId
              ? { ...t, progress: { ...t.progress, [milestone]: { status: "awaiting_teacher", fileName, files, answer, submittedAt: new Date().toISOString().slice(0, 10) } } }
              : t),
        };
      }
      const sub: Submission = {
        id: uid("sub"), teamId,
        teamName: team?.name ?? "Team",
        school: team?.school ?? "",
        country: team?.country ?? "",
        milestone, fileName, files, answer,
        submittedAt: new Date().toISOString().slice(0, 10),
        status: "pending",
        assignee: autoAssign(team?.country ?? ""),
      };
      // 5.6: "submission received" confirmation via the team's preferred channels
      const receipt = deliveriesFor(state.templates, "submission_received", team?.name ?? "Team", state.lang, { file: fileName });
      return {
        ...state,
        drafts,
        deliveries: [...receipt, ...state.deliveries],
        submissions: [sub, ...state.submissions],
        teams: state.teams.map((t) =>
          t.id === teamId
            ? {
                ...t,
                progress: {
                  ...t.progress,
                  [milestone]: {
                    status: "submitted", fileName,
                    files, answer,
                    submittedAt: sub.submittedAt,
                    feedback: undefined, score: undefined, criteria: undefined,
                  },
                },
              }
            : t),
      };
    }

    case "APPROVE_MILESTONE": {
      // teacher approves student work → it enters the judging queue
      const { teamId, milestone } = action;
      const team = state.teams.find((t) => t.id === teamId);
      const p = team?.progress[milestone];
      if (!team || !p) return state;
      const sub: Submission = {
        id: uid("sub"), teamId, teamName: team.name, school: team.school, country: team.country,
        milestone, fileName: p.fileName ?? "submission.txt", files: p.files, answer: p.answer,
        submittedAt: new Date().toISOString().slice(0, 10), status: "pending",
        assignee: autoAssign(team.country),
      };
      return {
        ...state,
        submissions: [sub, ...state.submissions],
        teams: state.teams.map((t) =>
          t.id === teamId ? { ...t, progress: { ...t.progress, [milestone]: { ...p, status: "submitted" } } } : t),
      };
    }

    case "SEND_BACK":
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.teamId
            ? { ...t, progress: { ...t.progress, [action.milestone]: { ...t.progress[action.milestone], status: "returned", feedback: action.note } } }
            : t),
      };

    case "CREATE_TEAM": {
      // 5.6: welcome message by every enabled channel
      const welcome = deliveriesFor(state.templates, "welcome", action.team.name, state.lang);
      return {
        ...state,
        activeTeam: action.team.id,
        teams: [action.team, ...state.teams],
        deliveries: [...welcome, ...state.deliveries],
        notifications: [
          { id: uid("nt"), title: action.notifTitle, body: action.notifBody, at: "now", read: false, kind: "award" },
          ...state.notifications,
        ],
      };
    }

    case "MOVE_MILESTONE": {
      const idx = state.milestones.findIndex((m) => m.id === action.id);
      const to = idx + action.dir;
      if (idx < 0 || to < 0 || to >= state.milestones.length) return state;
      const milestones = [...state.milestones];
      [milestones[idx], milestones[to]] = [milestones[to], milestones[idx]];
      return { ...state, milestones };
    }

    case "SCORE_SUBMISSION": {
      const score = Math.round(action.criteria.reduce((a, b) => a + b, 0) / action.criteria.length * 10);
      const sub = state.submissions.find((s) => s.id === action.id);
      // append-only audit trail — previous rounds are never overwritten
      const event: ScoreEvent = {
        id: uid("se"), at: new Date().toISOString().slice(0, 10), by: action.reviewer,
        decision: action.decision, total: score, criteria: action.criteria, feedback: action.feedback,
      };
      const notification = sub
        ? [{
            id: uid("nt"),
            title: action.notifTitle,
            body: action.notifBody,
            at: "now",
            read: false,
            kind: action.decision === "approved" ? ("award" as const) : ("alert" as const),
          }, ...state.notifications]
        : state.notifications;
      // 5.6: "feedback ready" / "returned" message to the teacher
      const msgEvent: MessageEvent = action.decision === "approved" ? "feedback_ready" : "returned";
      const note = deliveriesFor(state.templates, msgEvent, sub?.teamName ?? "Team", state.lang,
        { team: sub?.teamName ?? "", score: String(score), milestone: "" });
      return {
        ...state,
        deliveries: [...note, ...state.deliveries],
        submissions: state.submissions.map((s) =>
          s.id === action.id
            ? {
                ...s, status: action.decision, criteria: action.criteria, score, feedback: action.feedback,
                reviewedAt: event.at, history: [...(s.history ?? []), event],
              }
            : s),
        teams: state.teams.map((t) =>
          t.id === sub?.teamId
            ? {
                ...t,
                points: action.decision === "approved" ? t.points + score : t.points,
                progress: {
                  ...t.progress,
                  [sub?.milestone ?? 0]: {
                    ...t.progress[sub?.milestone ?? 0],
                    status: action.decision === "approved" ? "reviewed" : "returned",
                    score, criteria: action.criteria, feedback: action.feedback,
                  },
                },
                stage: action.decision === "approved" ? Math.min(4, t.stage + 1) : t.stage,
              }
            : t),
        notifications: notification,
      };
    }

    case "SEND_MESSAGE":
      return {
        ...state,
        threads: state.threads.map((th) =>
          th.id === action.threadId
            ? { ...th, messages: [...th.messages, { id: uid("mm"), author: "Me", body: action.body, at: action.at, mine: true }] }
            : th),
      };

    case "RECEIVE_MESSAGE":
      return {
        ...state,
        threads: state.threads.map((th) =>
          th.id === action.threadId
            ? { ...th, unread: th.unread + 1, messages: [...th.messages, { id: uid("mm"), author: action.author, body: action.body, at: action.at }] }
            : th),
      };

    case "MARK_THREAD_READ":
      return { ...state, threads: state.threads.map((th) => (th.id === action.threadId ? { ...th, unread: 0 } : th)) };
    case "MARK_ALL_READ":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };

    case "TOGGLE_SUSPEND":
      return {
        ...state,
        adminUsers: state.adminUsers.map((u) =>
          u.id === action.userId ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u),
      };

    case "UPDATE_MILESTONE":
      return { ...state, milestones: state.milestones.map((m) => (m.id === action.id ? { ...m, ...action.patch } : m)) };

    case "ADD_ANNOUNCEMENT": {
      const ann: Announcement = { id: uid("an"), title: action.title, body: action.body, audience: action.audience, at: action.at };
      const notif: AppNotification = { id: uid("nt"), title: action.title, body: action.body, at: "now", read: false, kind: "info" };
      return { ...state, announcements: [ann, ...state.announcements], notifications: [notif, ...state.notifications] };
    }

    case "TOGGLE_PARTNER":
      return { ...state, partners: state.partners.map((p) => (p.id === action.id ? { ...p, active: !p.active } : p)) };

    case "ADD_MEMBER":
      return { ...state, teams: state.teams.map((t) => (t.id === action.teamId ? { ...t, members: [...t.members, action.member] } : t)) };
    case "REMOVE_MEMBER":
      return { ...state, teams: state.teams.map((t) => (t.id === action.teamId ? { ...t, members: t.members.filter((m) => m.id !== action.memberId) } : t)) };
    case "TOGGLE_CONSENT":
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.teamId
            ? { ...t, members: t.members.map((m) => (m.id === action.memberId ? { ...m, consent: !m.consent } : m)) }
            : t),
      };
    case "SET_MEMBER_ROLE":
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.teamId
            ? { ...t, members: t.members.map((m) => (m.id === action.memberId ? { ...m, role: action.role } : m)) }
            : t),
      };

    case "REPORT_MESSAGE": {
      const flag: FlagItem = {
        id: uid("flag"), threadId: action.threadId, threadTitle: action.threadTitle,
        author: action.author, body: action.body, reporter: action.reporter, at: action.at, resolved: false,
      };
      return { ...state, flags: [flag, ...state.flags] };
    }
    case "RESOLVE_FLAG":
      return { ...state, flags: state.flags.map((f) => (f.id === action.id ? { ...f, resolved: true } : f)) };
    case "MERGE_SCHOOLS": {
      // one school = one record: fold duplicate registrations into the first contact/partner
      const matches = state.teams.filter((tm) => tm.school === action.name && tm.country === action.country);
      const keepPartner = matches[0]?.partnerId;
      const keepTeacher = matches[0]?.teacherName;
      if (!keepPartner) return state;
      return {
        ...state,
        teams: state.teams.map((tm) =>
          tm.school === action.name && tm.country === action.country
            ? { ...tm, partnerId: keepPartner, teacherName: keepTeacher ?? tm.teacherName }
            : tm),
      };
    }

    case "ASSIGN_SUBMISSION":
      return { ...state, submissions: state.submissions.map((s) => (s.id === action.id ? { ...s, assignee: action.assignee } : s)) };

    case "ADD_STAFF":
      return { ...state, adminUsers: [action.staff, ...state.adminUsers] };

    case "UPDATE_TEMPLATE":
      return { ...state, templates: state.templates.map((tp) => (tp.id === action.id ? { ...tp, ...action.patch } : tp)) };

    case "SEND_MANUAL": {
      // send to every team in scope (or "inactive" teams: still on milestone ≤ 1)
      const targets = state.teams.filter((tm) => {
        if (!tm.id.startsWith("team-") && tm.id.startsWith("gt-") && state.teams.indexOf(tm) > 60) return false; // demo: cap volume
        if (action.country !== "all" && tm.country !== action.country) return false;
        if (action.inactiveOnly && tm.stage > 1) return false;
        return true;
      }).slice(0, 24);
      const entries: Delivery[] = targets.flatMap((tm) =>
        action.channels.map((channel): Delivery => ({
          id: uid("dl"), to: tm.name, channel, event: action.inactiveOnly ? "reengage" : "manual",
          preview: `${action.subject} — ${action.body}`,
          at: action.at, status: "sent",
        }))
      );
      return { ...state, deliveries: [...entries, ...state.deliveries] };
    }

    case "PUSH_TOAST":
      return { ...state, toasts: [...state.toasts.slice(-2), action.toast] };
    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    default:
      return state;
  }
}

/* ---------- context ---------- */

interface AppApi {
  state: AppState;
  lang: Lang;
  user: User | null;
  /** translate a key into the active language */
  t: (key: string) => string;
  dispatch: React.Dispatch<Action>;
  setLang: (l: Lang) => void;
  login: (role: Role, name?: string, country?: string, email?: string) => User;
  logout: () => void;
  toast: (title: string, kind?: ToastMsg["kind"], body?: string) => void;
  myPersistentTeams: Team[];
  activeTeam: Team;
  totalPoints: number;
  unreadNotifs: number;
  resetDemo: () => void;
}

const Ctx = createContext<AppApi | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, freshState);

  // load persisted session once on mount (localStorage = our "database")
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        dispatch({ type: "HYDRATE", payload: { ...freshState(), ...parsed, toasts: [] } });
        return;
      }
    } catch { /* corrupted storage → just start fresh */ }
    dispatch({ type: "HYDRATE", payload: freshState() });
  }, []);

  // persist every change (except transient toasts)
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      const { toasts: _drop, ...persist } = state;
      void _drop;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
    } catch { /* storage full / private mode → ignore */ }
  }, [state]);

  const api = useMemo<AppApi>(() => {
    const t = (key: string) => translate(state.lang, key);
    const myPersistentTeams = state.teams.filter((tm) => tm.id.startsWith("team-"));
    const activeTeam = myPersistentTeams.find((tm) => tm.id === state.activeTeam) ?? myPersistentTeams[0];
    return {
      state,
      lang: state.lang,
      user: state.user,
      t,
      dispatch,
      setLang: (l) => dispatch({ type: "SET_LANG", lang: l }),
      login: (role, name, country, email) => {
        const persona = PERSONAS.find((p) => p.role === role);
        const user: User = {
          ...(persona ?? PERSONAS[0]),
          id: `u-${role}-${Date.now()}`,
          role,
          name: name || persona?.name || "Guest",
          country: country || persona?.country || "Kenya",
          email: email || persona?.email || "guest@sec.org",
        };
        dispatch({ type: "LOGIN", user });
        return user;
      },
      logout: () => dispatch({ type: "LOGOUT" }),
      toast: (title, kind = "success", body) =>
        dispatch({ type: "PUSH_TOAST", toast: { id: uid("toast"), title, body, kind } }),
      myPersistentTeams,
      activeTeam,
      totalPoints: state.milestones.reduce((a, m) => a + m.points, 0),
      unreadNotifs: state.notifications.filter((n) => !n.read).length,
      resetDemo: () => {
        try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
        dispatch({ type: "HYDRATE", payload: freshState() });
      },
    };
  }, [state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useApp(): AppApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside <StoreProvider>");
  return ctx;
}

export { PERSONAS };
