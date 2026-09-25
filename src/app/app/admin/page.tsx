"use client";

/* Admin panel — TAMTF's internal control room.
   Overview · People · Partners · Programme · Announce · Reports.
   Everything is real on-device state: suspending a user, moving a deadline
   or publishing an announcement instantly changes the rest of the app. */

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown, ArrowUp, Building2, CalendarClock, ChevronLeft, ChevronRight, ClipboardCheck,
  Download, FileDown, FileImage, FileText, Mail, Megaphone, MessageCircle, CirclePlay,
  Plus, Search, Send, ShieldAlert, ShieldCheck, Trash2,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { REVIEWERS } from "@/lib/mock";
import { uid } from "@/lib/utils";
import type { Announcement, Role } from "@/lib/types";
import {
  Avatar, Button, Card, CodeChip, cx, EmptyState, Field, Input, Modal, SectionHead,
  Select, Stat, Switch, Tabs, Textarea,
} from "@/components/ui";
import { Bars, Trend } from "@/components/charts";
import { REGION_STATS, TREND12 } from "@/lib/mock";
import { downloadText, fmtNum, toCSV } from "@/lib/utils";

type Tab = "ov" | "people" | "schools" | "partners" | "prog" | "review" | "msg" | "ann" | "rep" | "safe";
const PAGE = 12;

export default function AdminPage() {
  const { state, t, dispatch, toast } = useApp();
  const [tab, setTab] = useState<Tab>("ov");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-700">{t("brand.org")}</div>
          <p className="mt-1 text-sm text-ink-2">2025/26 · 60,000+ {t("c.students")} · 61 {t("c.countries")}</p>
        </div>
        <Tabs<Tab> value={tab} onChange={setTab} options={[
          { id: "ov", label: t("a.tabOverview") },
          { id: "people", label: t("a.tabPeople") },
          { id: "schools", label: t("a.tabSchools") },
          { id: "partners", label: t("a.tabPartners") },
          { id: "prog", label: t("a.tabProgramme") },
          { id: "review", label: t("a.tabReview") },
          { id: "msg", label: t("a.tabMsg") },
          { id: "ann", label: t("a.tabAnnounce") },
          { id: "rep", label: t("a.tabReports") },
          { id: "safe", label: t("a.tabSafety") },
        ]} />
      </div>

      {tab === "ov" && <Overview t={t} pending={state.submissions.filter((s) => s.status === "pending").length} orgCount={state.partners.length} />}
      {tab === "people" && <People />}
      {tab === "schools" && <Schools />}
      {tab === "partners" && <Partners />}
      {tab === "prog" && <Programme />}
      {tab === "review" && <ReviewMgmt />}
      {tab === "msg" && <MessagingMgr />}
      {tab === "ann" && <Announce />}
      {tab === "rep" && <Reports />}
      {tab === "safe" && <Safety />}
    </div>
  );
}

/* ---- overview ---- */
function Overview({ t, pending, orgCount }: { t: (k: string) => string; pending: number; orgCount: number }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t("a.kpiStudents")} value={fmtNum(60188)} accent />
        <Stat label={t("a.kpiSchools")} value={fmtNum(1311)} />
        <Stat label={t("a.kpiTeams")} value={fmtNum(2402)} />
        <Stat label={t("a.kpiOrgs")} value={String(orgCount)} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <SectionHead title={t("dash.trend")} />
          <Trend points={TREND12} />
        </Card>
        <Card className="p-5">
          <SectionHead title={t("dash.byRegion")} />
          <Bars data={REGION_STATS.map((r) => ({ label: r.region, value: r.teams + r.schools }))} />
        </Card>
      </div>
      <Card className="flex flex-wrap items-center justify-between gap-4 border-gold-500/40 bg-gold-400/10 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/30 text-gold-700"><ClipboardCheck size={20} /></span>
          <div>
            <div className="font-display text-lg text-ink">{t("dash.backlog")}: {pending}</div>
            <div className="text-sm text-ink-2">{t("rv.sliderHint")}</div>
          </div>
        </div>
        <Button variant="dark" onClick={() => window.location.assign("/app/review")}>{t("a.backlogCta")}</Button>
      </Card>
    </div>
  );
}

/* ---- people ---- */
function People() {
  const { state, t, dispatch, toast } = useApp();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(0);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("reviewer");

  const rows = useMemo(() => state.adminUsers.filter((u) => {
    if (role !== "all" && u.role !== role) return false;
    if (q && !`${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [state.adminUsers, q, role]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = rows.slice(safePage * PAGE, safePage * PAGE + PAGE);

  // reset to page 1 when the search or role filter changes
  useEffect(() => { setPage(0); }, [q, role]);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline p-4">
        <SectionHead title={t("a.peopleTitle")} className="mb-0 mr-auto" />
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("a.peopleSearch")}
            className="w-52 rounded-full border border-hairline bg-paper py-2 pl-9 pr-3 text-sm outline-none focus:border-gold-500" />
        </div>
        <Select value={role} onChange={(e) => setRole(e.target.value)} className="w-36">
          <option value="all">{t("a.filterRole")}: {t("c.all")}</option>
          {(["student", "teacher", "reviewer", "partner", "admin"] as Role[]).map((r) => (
            <option key={r} value={r}>{t("role." + r)}</option>
          ))}
        </Select>
      </div>
      {/* create staff / reviewer accounts (roles & permissions) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-paper/50 px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-widest text-ink-2/70">{t("a.staffAdd")}</span>
        <Input className="!w-40 !py-1.5 !text-xs" placeholder={t("s.name")} value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Input className="!w-48 !py-1.5 !text-xs" placeholder={t("l.email")} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        <Select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)} className="!w-32 !py-1.5 !text-xs">
          {(["reviewer", "partner", "admin"] as Role[]).map((r) => <option key={r} value={r}>{t("role." + r)}</option>)}
        </Select>
        <Button variant="gold" size="sm" disabled={!newName.trim() || !newEmail.trim()}
          onClick={() => {
            dispatch({
              type: "ADD_STAFF",
              staff: { id: uid("au"), name: newName.trim(), email: newEmail.trim(), role: newRole, country: "United Kingdom", status: "active", joined: new Date().toISOString().slice(0, 10) },
            });
            setNewName(""); setNewEmail("");
            toast(t("a.staffAdded"), "success");
          }}>
          <Plus size={14} /> {t("c.add")}
        </Button>
      </div>
      <div className="thin-scroll overflow-x-auto">
        <table className="w-full min-w-160 text-left text-sm">
          <thead>
            <tr className="border-b border-hairline bg-paper/70 text-[11px] font-bold uppercase tracking-widest text-ink-2/70">
              <th className="px-4 py-3">{t("a.colName")}</th>
              <th className="px-4 py-3">{t("a.colRole")}</th>
              <th className="px-4 py-3">{t("a.colCountry")}</th>
              <th className="px-4 py-3">{t("a.colJoined")}</th>
              <th className="px-4 py-3">{t("c.status")}</th>
              <th className="px-4 py-3 text-right">{t("c.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline/60">
            {pageRows.map((u) => (
              <tr key={u.id} className="transition hover:bg-gold-400/5">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={u.name} hue={u.name.charCodeAt(0) * 7} size={30} />
                    <div>
                      <div className="font-semibold text-ink">{u.name}</div>
                      <div className="text-[11px] text-ink-2/60">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-ink-2">{t("role." + u.role)}</td>
                <td className="px-4 py-2.5 text-ink-2">{u.country}</td>
                <td className="px-4 py-2.5 text-ink-2">{u.joined}</td>
                <td className="px-4 py-2.5">
                  <span className={cx("rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                    u.status === "active" ? "bg-pine-100 text-pine-700" : "bg-clay-500/10 text-clay-600")}>
                    {u.status === "active" ? t("c.active") : t("c.suspended")}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Button variant={u.status === "active" ? "outline" : "gold"} size="sm"
                    onClick={() => dispatch({ type: "TOGGLE_SUSPEND", userId: u.id })}>
                    {u.status === "active" ? t("a.suspend") : t("a.activate")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageRows.length === 0 && <div className="p-6"><EmptyState title={t("c.emptyTitle")} /></div>}
      <div className="flex items-center justify-between border-t border-hairline px-4 py-3">
        <span className="text-xs font-semibold text-ink-2/70">{rows.length} · {safePage + 1}/{pageCount}</span>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}><ChevronLeft size={15} /></Button>
          <Button variant="outline" size="sm" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}><ChevronRight size={15} /></Button>
        </div>
      </div>
    </Card>
  );
}

/* ---- partners ---- */
function Partners() {
  const { state, t, dispatch } = useApp();
  return (
    <div>
      <SectionHead title={t("a.partnersTitle")} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {state.partners.map((p) => {
          const teams = state.teams.filter((tm) => tm.partnerId === p.id).length;
          return (
            <Card key={p.id} className={cx("p-5 transition", !p.active && "opacity-60")}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pine-950 text-gold-300"><Building2 size={18} /></span>
                  <div>
                    <div className="font-display text-base leading-tight text-ink">{p.name}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-2/70"><CodeChip code={p.code} /> {p.country}</div>
                  </div>
                </div>
                <Switch checked={p.active} onChange={() => dispatch({ type: "TOGGLE_PARTNER", id: p.id })} label={p.active ? t("c.active") : t("c.suspended")} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-paper py-2">
                  <div className="font-display text-lg text-ink">{p.schools}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-ink-2/60">{t("c.schools")}</div>
                </div>
                <div className="rounded-lg bg-paper py-2">
                  <div className="font-display text-lg gold-text">{fmtNum(teams)}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-ink-2/60">{t("c.teams")}</div>
                </div>
                <div className="rounded-lg bg-paper py-2">
                  <div className="font-display text-lg text-ink">{fmtNum(teams * 7)}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-ink-2/60">{t("c.students")}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-ink-2/70">{t("a.contactPerson")}: <span className="font-semibold text-ink">{p.contact}</span></div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---- programme config ---- */
function Programme() {
  const { state, t, dispatch, toast } = useApp();
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(state.milestones.map((m) => [m.id, { en: m.name.en, es: m.name.es, guidanceEn: m.guidance.en, guidanceEs: m.guidance.es, points: m.points, due: m.due, open: m.open }]))
  );

  const save = (id: number) => {
    const d = drafts[id];
    dispatch({
      type: "UPDATE_MILESTONE", id,
      patch: {
        name: { en: d.en, es: d.es },
        guidance: { en: d.guidanceEn, es: d.guidanceEs },
        points: Number(d.points) || 0, due: d.due, open: d.open,
      },
    });
    toast(t("a.progSaved"), "success");
  };

  const kindIcon: Record<string, React.ElementType> = { image: FileImage, document: FileText, video: CirclePlay };

  return (
    <div>
      <SectionHead title={t("a.progTitle")} kicker={t("a.progHint")} />
      <div className="space-y-3">
        {state.milestones.map((m, idx) => {
          const d = drafts[m.id];
          return (
            <Card key={m.id} className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* order + position controls: milestones are data, reorderable without code changes */}
                <div className="flex items-center gap-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/15 font-display text-lg text-gold-700">{idx + 1}</span>
                  <div className="flex flex-col">
                    <button disabled={idx === 0} onClick={() => dispatch({ type: "MOVE_MILESTONE", id: m.id, dir: -1 })}
                      className="rounded p-0.5 text-ink-2 hover:bg-ink/5 disabled:opacity-25" aria-label="Move up"><ArrowUp size={13} /></button>
                    <button disabled={idx === state.milestones.length - 1} onClick={() => dispatch({ type: "MOVE_MILESTONE", id: m.id, dir: 1 })}
                      className="rounded p-0.5 text-ink-2 hover:bg-ink/5 disabled:opacity-25" aria-label="Move down"><ArrowDown size={13} /></button>
                  </div>
                </div>
                <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                  <Input value={d.en} onChange={(e) => setDrafts({ ...drafts, [m.id]: { ...d, en: e.target.value } })} aria-label={t("a.progName")} />
                  <Input value={d.es} onChange={(e) => setDrafts({ ...drafts, [m.id]: { ...d, es: e.target.value } })} aria-label={t("a.progNameEs")} />
                  <Input type="number" value={d.points} onChange={(e) => setDrafts({ ...drafts, [m.id]: { ...d, points: Number(e.target.value) } })} aria-label={t("a.progPoints")} />
                  <Input type="date" value={d.due} onChange={(e) => setDrafts({ ...drafts, [m.id]: { ...d, due: e.target.value } })} aria-label={t("a.progDue")} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ink-2">
                    <Switch checked={d.open} onChange={(v) => setDrafts({ ...drafts, [m.id]: { ...d, open: v } })} label={t("a.progOpen")} />
                    {d.open ? t("c.active") : "—"}
                  </div>
                  <Button variant="gold" size="sm" onClick={() => save(m.id)}><CalendarClock size={14} /> {t("c.save")}</Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 pl-12 text-xs text-ink-2/70">
                <span className="font-bold uppercase tracking-widest text-[10px]">{t("a.accepts")}:</span>
                {m.accepts.map((k) => {
                  const Icon = kindIcon[k] ?? FileText;
                  return (
                    <span key={k} className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-2 py-0.5 font-semibold">
                      <Icon size={11} /> {t(k === "image" ? "j.typeImage" : k === "video" ? "j.typeVideo" : "j.typeDocument")}
                    </span>
                  );
                })}
                <span className="ml-2 font-bold uppercase tracking-widest text-[10px]">{t("j.guidance")}:</span>
                <Input className="!h-8 min-w-52 flex-1 !py-1 !text-xs" value={d.guidanceEn.split("\n")[0]}
                  onChange={(e) => setDrafts({ ...drafts, [m.id]: { ...d, guidanceEn: e.target.value } })} aria-label="Guidance (EN)" />
                <Button variant="outline" size="sm" onClick={() => save(m.id)}>{t("c.save")}</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---- announcements ---- */
function Announce() {
  const { state, t, dispatch, toast } = useApp();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Announcement["audience"]>("all");

  const publish = () => {
    if (!title.trim() || !body.trim()) return;
    dispatch({
      type: "ADD_ANNOUNCEMENT", title, body, audience,
      at: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    });
    toast(t("a.annSent"), "success");
    setTitle(""); setBody("");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="p-5">
        <SectionHead title={t("a.annTitle")} kicker="TAMTF" />
        <div className="space-y-4">
          <Field label={t("a.annFieldTitle")}>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deadline moved to Friday" />
          </Field>
          <Field label={t("a.annFieldBody")}>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="…" />
          </Field>
          <Field label={t("a.annAudience")}>
            <div className="grid grid-cols-3 gap-2">
              {(["all", "teachers", "judges"] as const).map((a) => (
                <button key={a} type="button" onClick={() => setAudience(a)} aria-pressed={audience === a}
                  className={cx("rounded-xl border px-3 py-2.5 text-xs font-bold transition",
                    audience === a ? "border-gold-500 bg-gold-400/15 text-gold-700" : "border-hairline text-ink-2 hover:border-gold-500/40")}>
                  {t(a === "all" ? "a.audAll" : a === "teachers" ? "a.audTeachers" : "a.audJudges")}
                </button>
              ))}
            </div>
          </Field>
          <Button variant="gold" onClick={publish} disabled={!title.trim() || !body.trim()} className="w-full">
            <Send size={15} /> {t("a.annSend")}
          </Button>
        </div>
      </Card>
      <Card className="p-5">
        <SectionHead title={t("a.annPreview")} />
        <div className="flex items-start gap-3 rounded-2xl border border-gold-500/40 bg-gold-400/10 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-400/30 text-gold-700"><Megaphone size={16} /></span>
          <div>
            <div className="text-sm font-bold text-ink">{title || t("a.annFieldTitle")}</div>
            <p className="mt-1 text-sm leading-relaxed text-ink-2">{body || "…"}</p>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-ink-2/50">
              {audience === "all" ? t("a.audAll") : audience === "teachers" ? t("a.audTeachers") : t("a.audJudges")}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-2/70">{t("a.annHistory")}</div>
          <div className="space-y-2.5">
            {state.announcements.map((a) => (
              <div key={a.id} className="rounded-xl border border-hairline bg-paper p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-ink">{a.title}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-ink-2/50">{a.at}</div>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-2/80">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---- schools directory (5.8: one school = one record) ---- */
function Schools() {
  const { state, t, dispatch, toast } = useApp();
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState<{ name: string; country: string } | null>(null);

  // fold the team list into per-school records across all 2,400 teams
  const rows = useMemo(() => {
    const map = new Map<string, { name: string; country: string; teams: number; contacts: Set<string>; partners: Set<string> }>();
    for (const tm of state.teams) {
      const key = `${tm.school}||${tm.country}`;
      const e = map.get(key) ?? { name: tm.school, country: tm.country, teams: 0, contacts: new Set<string>(), partners: new Set<string>() };
      e.teams += 1;
      e.contacts.add(tm.teacherName);
      e.partners.add(tm.partnerId);
      map.set(key, e);
    }
    return [...map.values()]
      .sort((a, b) => b.contacts.size - a.contacts.size || b.teams - a.teams)
      .filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase()));
  }, [state.teams, q]);

  return (
    <div>
      <SectionHead title={t("a.schoolsTitle")} kicker={t("a.schoolsHint")} />
      <div className="mb-3 relative max-w-sm">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2/40" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("a.peopleSearch")}
          className="w-full rounded-full border border-hairline bg-cream py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold-500" />
      </div>
      <Card className="overflow-hidden">
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-150 text-left text-sm">
            <thead>
              <tr className="border-b border-hairline bg-paper/70 text-[11px] font-bold uppercase tracking-widest text-ink-2/70">
                <th className="px-4 py-3">{t("sg.school")}</th>
                <th className="px-4 py-3">{t("a.colCountry")}</th>
                <th className="px-4 py-3 text-right">{t("a.schoolTeams")}</th>
                <th className="px-4 py-3 text-right">{t("a.schoolContacts")}</th>
                <th className="px-4 py-3">{t("c.status")}</th>
                <th className="px-4 py-3 text-right">{t("c.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline/60">
              {rows.slice(0, 40).map((r) => {
                const dup = r.contacts.size > 1 || r.partners.size > 1;
                return (
                  <tr key={r.name + r.country} className="transition hover:bg-gold-400/5">
                    <td className="px-4 py-3 font-semibold text-ink">{r.name}</td>
                    <td className="px-4 py-3 text-ink-2">{r.country}</td>
                    <td className="px-4 py-3 text-right font-bold text-ink">{r.teams}</td>
                    <td className="px-4 py-3 text-right text-ink-2">{r.contacts.size}</td>
                    <td className="px-4 py-3">
                      {dup
                        ? <span className="rounded-full bg-clay-500/15 px-2.5 py-0.5 text-[11px] font-bold text-clay-600">{t("a.dupSuspect")}</span>
                        : <span className="rounded-full bg-pine-100 px-2.5 py-0.5 text-[11px] font-bold text-pine-700">OK</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {dup && <Button variant="outline" size="sm" onClick={() => setConfirm({ name: r.name, country: r.country })}>{t("a.consolidate")}</Button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <div className="p-6"><EmptyState title={t("c.emptyTitle")} /></div>}
      </Card>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title={t("a.consolidate")}>
        <p className="text-sm font-semibold text-ink">“{confirm?.name}” · {confirm?.country}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">{t("a.consolidateBody")}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setConfirm(null)}>{t("c.cancel")}</Button>
          <Button variant="gold" className="flex-1" onClick={() => {
            if (confirm) dispatch({ type: "MERGE_SCHOOLS", name: confirm.name, country: confirm.country });
            setConfirm(null);
            toast(t("a.consolidated"), "success");
          }}>
            {t("a.consolidate")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

/* ---- safeguarding moderation queue (Section 10) ---- */
function Safety() {
  const { state, t, dispatch, toast } = useApp();
  const [filter, setFilter] = useState<"open" | "done" | "all">("open");
  const openCount = state.flags.filter((f) => !f.resolved).length;
  const rows = state.flags.filter((f) => filter === "all" || (filter === "open" ? !f.resolved : f.resolved));

  return (
    <div>
      <SectionHead
        title={t("a.safetyTitle")}
        kicker={`${openCount} ${t("a.flagOpen").toLowerCase()} — ${t("a.safetyHint")}`}
      />
      <div className="mb-4 flex items-start gap-3 rounded-2xl border border-clay-500/30 bg-clay-500/10 p-4">
        <ShieldAlert size={17} className="mt-0.5 shrink-0 text-clay-600" />
        <p className="text-xs leading-relaxed text-ink">{t("a.safetyPolicy")}</p>
      </div>
      <Tabs value={filter} onChange={(v) => setFilter(v as typeof filter)} options={[
        { id: "open", label: t("a.flagOpen") },
        { id: "done", label: t("a.flagResolved") },
        { id: "all", label: t("c.all") },
      ]} className="mb-4 w-fit" />
      <div className="space-y-3">
        {rows.length === 0 && <EmptyState title={t("c.emptyTitle")} body={t("a.safetyEmpty")} icon={<ShieldCheck size={28} />} />}
        {rows.map((f) => (
          <Card key={f.id} className={cx("p-5", f.resolved && "opacity-60")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink">
                  {f.author}
                  <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    f.resolved ? "bg-pine-100 text-pine-700" : "bg-clay-500/15 text-clay-600")}>
                    {f.resolved ? t("a.flagResolved") : t("a.flagOpen")}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] font-semibold text-ink-2/60">
                  {t("a.inChat")}: {f.threadTitle} · {t("a.flagBy")}: {f.reporter} · {f.at}
                </div>
                <p className="mt-3 rounded-xl bg-paper p-3.5 font-display text-sm italic leading-relaxed text-ink">“{f.body}”</p>
              </div>
              {!f.resolved && (
                <Button variant="gold" size="sm" onClick={() => { dispatch({ type: "RESOLVE_FLAG", id: f.id }); toast(t("a.flagResolved"), "success"); }}>
                  <ShieldCheck size={14} /> {t("a.resolve")}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---- review management: assignment, turnaround, rubrics (Section 6) ---- */
function ReviewMgmt() {
  const { state, t, lang, dispatch, toast } = useApp();
  const [rubricFor, setRubricFor] = useState(1);
  const milestone = state.milestones.find((m) => m.id === rubricFor) ?? state.milestones[0];

  // workload + turnaround per reviewer
  const reviewers = REVIEWERS.map((r) => {
    const mine = state.submissions.filter((s) => s.assignee === r.name);
    const done = mine.filter((s) => s.reviewedAt);
    const avg = done.length
      ? Math.round(done.reduce((a, s) => a + Math.max(0, (new Date(s.reviewedAt!).getTime() - new Date(s.submittedAt).getTime()) / 86400000), 0) / done.length)
      : 0;
    return { ...r, total: mine.length, pending: mine.filter((s) => s.status === "pending").length, avg };
  });

  const unassigned = state.submissions.filter((s) => s.status === "pending").slice(0, 8);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* reviewers */}
      <Card className="p-5">
        <SectionHead title={t("a.reviewers")} kicker={t("a.reviewersHint")} />
        <div className="space-y-2">
          {reviewers.map((r) => (
            <div key={r.name} className="flex items-center gap-3 rounded-xl border border-hairline bg-paper p-3">
              <Avatar name={r.name} hue={r.name.charCodeAt(0) * 9} size={36} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-ink">{r.name}</div>
                <div className="text-[11px] text-ink-2/60">{r.regions.join(" · ")}</div>
              </div>
              <div className="text-center"><div className="font-display text-lg text-ink">{r.total}</div><div className="text-[9px] font-bold uppercase tracking-widest text-ink-2/60">{t("c.teams")}</div></div>
              <div className="text-center"><div className="font-display text-lg text-clay-600">{r.pending}</div><div className="text-[9px] font-bold uppercase tracking-widest text-ink-2/60">{t("rv.pendingTag")}</div></div>
              <div className="text-center"><div className="font-display text-lg gold-text">{r.avg}{t("a.daysShort")}</div><div className="text-[9px] font-bold uppercase tracking-widest text-ink-2/60">{t("a.turnaround")}</div></div>
            </div>
          ))}
        </div>
        {/* assign / reassign */}
        <div className="mt-5">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-2/70">{t("rv.title")}</div>
          <div className="space-y-1.5">
            {unassigned.map((s) => (
              <div key={s.id} className="flex items-center gap-2 rounded-xl border border-hairline bg-cream p-2.5 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink">{s.teamName}</div>
                  <div className="text-[11px] text-ink-2/60">{s.country} · {state.milestones.find((m) => m.id === s.milestone)?.name[lang]}</div>
                </div>
                <Select value={s.assignee ?? ""} onChange={(e) => { dispatch({ type: "ASSIGN_SUBMISSION", id: s.id, assignee: e.target.value }); toast(t("a.assigned"), "success", `${s.teamName} → ${e.target.value}`); }}
                  className="w-32 !py-1.5 text-xs" aria-label={t("a.assignTo")}>
                  {REVIEWERS.map((r) => <option key={r.name} value={r.name}>{r.name}</option>)}
                </Select>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* rubric editor */}
      <Card className="p-5">
        <SectionHead title={t("a.rubricTitle")} kicker={t("a.rubricHint")} />
        <Select value={String(rubricFor)} onChange={(e) => setRubricFor(Number(e.target.value))} className="mb-3 w-full">
          {state.milestones.map((m) => <option key={m.id} value={m.id}>{m.name[lang]}</option>)}
        </Select>
        <div className="space-y-2">
          {milestone.rubric.map((c, i) => (
            <div key={c.id} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs font-bold text-ink-2/70">{t("a.criterion")} {i + 1}</span>
              <Input className="!py-1.5 text-xs" value={c.labels.en} aria-label="EN"
                onChange={(e) => dispatch({ type: "UPDATE_MILESTONE", id: milestone.id, patch: { rubric: milestone.rubric.map((x) => x.id === c.id ? { ...x, labels: { ...x.labels, en: e.target.value } } : x) } })} />
              <Input className="!py-1.5 text-xs" value={c.labels.es} aria-label="ES"
                onChange={(e) => dispatch({ type: "UPDATE_MILESTONE", id: milestone.id, patch: { rubric: milestone.rubric.map((x) => x.id === c.id ? { ...x, labels: { ...x.labels, es: e.target.value } } : x) } })} />
              <button className="rounded-full p-1.5 text-clay-600 hover:bg-clay-500/10 disabled:opacity-30"
                disabled={milestone.rubric.length <= 1}
                onClick={() => { dispatch({ type: "UPDATE_MILESTONE", id: milestone.id, patch: { rubric: milestone.rubric.filter((x) => x.id !== c.id) } }); toast(t("a.rubricSaved"), "success"); }}
                aria-label={t("c.remove")}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-3"
          disabled={milestone.rubric.length >= 6}
          onClick={() => {
            dispatch({ type: "UPDATE_MILESTONE", id: milestone.id, patch: { rubric: [...milestone.rubric, { id: uid("cr"), labels: { en: "New criterion", es: "Nuevo criterio" } }] } });
            toast(t("a.rubricSaved"), "success");
          }}>
          <Plus size={14} /> {t("a.addCriterion")}
        </Button>
      </Card>
    </div>
  );
}

/* ---- messaging manager: templates, history, manual sends (5.6) ---- */
function MessagingMgr() {
  const { state, t, lang, dispatch, toast } = useApp();
  const [q, setQ] = useState("");
  const manual = state.templates.find((tp) => tp.event === "manual");
  const [subject, setSubject] = useState(manual?.subject.en ?? "");
  const [body, setBody] = useState(manual?.body.en ?? "");
  const [country, setCountry] = useState("all");
  const [inactiveOnly, setInactiveOnly] = useState(true);

  const history = state.deliveries.filter((d) => !q || `${d.to} ${d.preview}`.toLowerCase().includes(q.toLowerCase())).slice(0, 40);
  const predicted = state.teams.filter((tm) =>
    (tm.id.startsWith("team-") || state.teams.indexOf(tm) <= 60) &&
    (country === "all" || tm.country === country) &&
    (!inactiveOnly || tm.stage <= 1)
  ).slice(0, 24).length;

  const now = () => new Date().toISOString().slice(0, 16).replace("T", " ");

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* templates */}
      <div className="space-y-3">
        <SectionHead title={t("a.msgsTitle")} kicker={t("a.msgsHint")} />
        {state.templates.map((tp) => (
          <Card key={tp.id} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gold-400/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-700">{t("ev." + tp.event)}</span>
                <span className="flex gap-1 text-ink-2/60">
                  {tp.channels.map((c) => c === "email" ? <Mail key={c} size={13} /> : <MessageCircle key={c} size={13} />)}
                </span>
              </div>
              <Switch checked={tp.enabled} onChange={(v) => dispatch({ type: "UPDATE_TEMPLATE", id: tp.id, patch: { enabled: v } })} label={t("c.active")} />
            </div>
            <div className="mt-3 grid gap-2">
              <Input className="!py-1.5 text-xs" value={tp.subject.en} placeholder="Subject (EN)" aria-label="Subject EN"
                onChange={(e) => dispatch({ type: "UPDATE_TEMPLATE", id: tp.id, patch: { subject: { ...tp.subject, en: e.target.value } } })} />
              <Input className="!py-1.5 text-xs" value={tp.subject.es} placeholder="Asunto (ES)" aria-label="Subject ES"
                onChange={(e) => dispatch({ type: "UPDATE_TEMPLATE", id: tp.id, patch: { subject: { ...tp.subject, es: e.target.value } } })} />
              <Textarea className="!min-h-14 !text-xs" value={tp.body.en} placeholder="Body (EN)" aria-label="Body EN"
                onChange={(e) => dispatch({ type: "UPDATE_TEMPLATE", id: tp.id, patch: { body: { ...tp.body, en: e.target.value } } })} />
              <Textarea className="!min-h-14 !text-xs" value={tp.body.es} placeholder="Cuerpo (ES)" aria-label="Body ES"
                onChange={(e) => dispatch({ type: "UPDATE_TEMPLATE", id: tp.id, patch: { body: { ...tp.body, es: e.target.value } } })} />
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-5">
        {/* manual send */}
        <Card className="p-5">
          <SectionHead title={t("a.sendTitle")} />
          <div className="space-y-3">
            <Field label={t("a.subject")}><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
            <Field label={t("a.body")}><Textarea value={body} onChange={(e) => setBody(e.target.value)} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("p.filterCountry")}>
                <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="all">{t("c.all")}</option>
                  {Array.from(new Set(state.teams.map((tm) => tm.country))).sort().slice(0, 61).map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-ink-2">
                  <Switch checked={inactiveOnly} onChange={setInactiveOnly} label={t("a.scoInactive")} />
                  {t("a.scoInactive")}
                </label>
              </div>
            </div>
            <Button variant="gold" className="w-full" disabled={!subject.trim() || predicted === 0}
              onClick={() => {
                dispatch({ type: "SEND_MANUAL", templateId: "tpl-man", subject, body, channels: manual?.channels ?? ["email"], country, inactiveOnly, at: now() });
                toast(t("a.sentN").replace("{n}", String(predicted)), "success");
              }}>
              <Send size={15} /> {t("a.sendNow")} · {predicted}
            </Button>
          </div>
        </Card>

        {/* delivery history */}
        <Card className="overflow-hidden">
          <div className="border-b border-hairline p-4">
            <SectionHead title={t("a.dlTitle")} kicker={t("a.dlHint")} className="mb-2" />
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2/40" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("a.peopleSearch")}
                className="w-full rounded-full border border-hairline bg-paper py-2 pl-9 pr-3 text-sm outline-none focus:border-gold-500" />
            </div>
          </div>
          <div className="thin-scroll max-h-100 divide-y divide-hairline/60 overflow-y-auto">
            {history.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  d.channel === "email" ? "bg-pine-100 text-pine-700" : "bg-gold-400/20 text-gold-700")}>
                  {d.channel === "email" ? <Mail size={13} /> : <MessageCircle size={13} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-ink">{d.to}</span>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-ink-2/50">
                      {d.status === "queued" ? t("a.queuedTag") : d.at}
                    </span>
                  </div>
                  <div className="truncate text-xs text-ink-2/75">{d.preview}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink-2/45">{t("ev." + d.event)}</div>
                </div>
              </div>
            ))}
            {history.length === 0 && <div className="p-6"><EmptyState title={t("c.emptyTitle")} /></div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---- reports & export — filterable, replaces manual spreadsheet-merging ---- */
function Reports() {
  const { state, t, toast } = useApp();
  const [fCountry, setFCountry] = useState("all");
  const [fPartner, setFPartner] = useState("all");
  const [fStage, setFStage] = useState("all");

  // one filter, applied to every export so reports never need re-merging
  const within = (row: { country: string; partnerId?: string; stage?: number }) =>
    (fCountry === "all" || row.country === fCountry) &&
    (fPartner === "all" || row.partnerId === fPartner) &&
    (fStage === "all" || row.stage === Number(fStage));

  const download = (kind: string) => {
    let csv = "";
    if (kind === "teams") csv = toCSV(state.teams.filter(within).map((tm) => ({ team: tm.name, school: tm.school, country: tm.country, region: tm.region, stage: tm.stage, points: tm.points })));
    if (kind === "users") csv = toCSV(state.adminUsers.filter((u) => within({ country: u.country })).map((u) => ({ name: u.name, email: u.email, role: u.role, country: u.country, status: u.status, joined: u.joined })));
    if (kind === "subs") {
      const back = new Map(state.teams.map((tm) => [tm.id, tm]));
      csv = toCSV(state.submissions.filter((s) => within({ country: s.country, partnerId: back.get(s.teamId)?.partnerId, stage: s.milestone })).map((s) => ({ team: s.teamName, school: s.school, country: s.country, milestone: s.milestone, file: s.fileName, submitted: s.submittedAt, status: s.status, score: s.score ?? "" })));
    }
    if (kind === "scores") csv = toCSV(state.submissions.filter((s) => s.criteria && within({ country: s.country, stage: s.milestone })).map((s) => ({ team: s.teamName, country: s.country, milestone: s.milestone, ...Object.fromEntries((s.criteria ?? []).map((c, i) => [`criterion_${i + 1}`, c])), total: s.score ?? "" })));
    downloadText(`sec-${kind}-report.csv`, csv, "text/csv");
    toast(t("t.exported"), "success");
  };

  const cards = [
    { id: "teams", title: t("a.repTeams"), desc: t("a.repTeamsDesc") },
    { id: "users", title: t("a.repUsers"), desc: t("a.repUsersDesc") },
    { id: "subs", title: t("a.repSubs"), desc: t("a.repSubsDesc") },
    { id: "scores", title: t("a.repScores"), desc: t("a.repScoresDesc") },
  ];

  return (
    <div>
      <SectionHead title={t("a.reportsTitle")} kicker="CSV" />
      <div className="mb-3 flex flex-wrap gap-2">
        <Select value={fCountry} onChange={(e) => setFCountry(e.target.value)} className="!w-44 !py-2 !text-xs">
          <option value="all">{t("p.filterCountry")}: {t("c.all")}</option>
          {Array.from(new Set(state.teams.map((tm) => tm.country))).sort().map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select value={fPartner} onChange={(e) => setFPartner(e.target.value)} className="!w-52 !py-2 !text-xs">
          <option value="all">{t("c.partners")}: {t("c.all")}</option>
          {state.partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Select value={fStage} onChange={(e) => setFStage(e.target.value)} className="!w-44 !py-2 !text-xs">
          <option value="all">{t("p.stageOf")}: {t("c.all")}</option>
          {state.milestones.map((m) => <option key={m.id} value={m.id}>{m.name[state.lang]}</option>)}
        </Select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <Card key={c.id} className="flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pine-950 text-gold-300"><FileDown size={20} /></span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-base text-ink">{c.title}</div>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-2/75">{c.desc}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => download(c.id)}>
              <Download size={13} /> CSV
            </Button>
          </Card>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-ink-2/60">
        <ShieldCheck size={14} className="text-pine-700" />
        Exports contain no student surnames — safeguarding rules apply to reports too.
      </p>
    </div>
  );
}
