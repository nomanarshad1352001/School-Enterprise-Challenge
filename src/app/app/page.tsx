"use client";

/* Home dashboard — renders a different workspace per role:
   teacher/student → journey overview · reviewer → review queue stats
   partner → organisation KPIs · admin → platform health */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CircleCheck, ClipboardCheck, Download, Flag,
  Megaphone, MessageSquare, Send, Sparkles, UserPlus,
} from "lucide-react";
import { useApp } from "@/lib/store";
import type { MilestoneCfg, SubmissionDraft, Team } from "@/lib/types";
import { Avatar, Button, Card, cx, EmptyState, SectionHead, Stat } from "@/components/ui";
import { Bars, Donut, Trend } from "@/components/charts";
import { REGION_STATS, TREND12 } from "@/lib/mock";
import { fmtDate, fmtNum } from "@/lib/utils";

const formatDue = fmtDate;

function greetingKey() {
  const h = new Date().getHours();
  return h < 12 ? "dash.morning" : h < 18 ? "dash.afternoon" : "dash.evening";
}

/** "Where am I, and what should I do next?" — the charity's named requirement. */
function nextActionFor(
  team: Team, drafts: Record<string, SubmissionDraft>, milestones: MilestoneCfg[], lang: string, t: (k: string) => string
): string {
  for (const m of milestones) {
    const p = team.progress[m.id];
    const draft = drafts[`${team.id}:${m.id}`];
    if (p?.status === "reviewed") continue;
    if (p?.status === "returned") return t("dash.next.stepReturned").replace("{m}", m.name[lang as "en" | "es"]);
    if (p?.status === "submitted") return t("dash.next.stepWaiting");
    if (draft) return t("dash.next.stepDraft").replace("{m}", m.name[lang as "en" | "es"]);
    if (p?.status === "open" || m.id <= team.stage) {
      return t("dash.next.stepOpen").replace("{m}", m.name[lang as "en" | "es"]).replace("{d}", formatDue(m.due));
    }
    break;
  }
  return t("dash.next.stepDone");
}

function TeacherHome() {
  const { state, activeTeam, t, totalPoints, myPersistentTeams, dispatch } = useApp();
  const router = useRouter();

  const done = Object.values(activeTeam.progress).filter((p) => p.status === "reviewed").length;
  const nextStep = nextActionFor(activeTeam, state.drafts, state.milestones, state.lang, t);
  const lastFeedback = Object.entries(activeTeam.progress)
    .reverse()
    .find(([, p]) => p.feedback)?.[1];
  const board = [...state.teams].sort((a, b) => b.points - a.points).slice(0, 6);
  const rank = [...state.teams].sort((a, b) => b.points - a.points).findIndex((tm) => tm.id === activeTeam.id) + 1;

  return (
    <div className="space-y-5">
      {/* hero progress card */}
      <Card className="grain relative overflow-hidden bg-pine-950 p-5 text-cream sm:p-6">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gold-400/15 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-5">
          <Donut value={activeTeam.points} max={totalPoints} size={108} invert label={`${Math.round((activeTeam.points / totalPoints) * 100)}%`} sub={t("dash.journey")} />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300">{activeTeam.name}</div>
            <h2 className="mt-1 font-display text-2xl font-light tracking-tight sm:text-3xl">
              {t(greetingKey())}, {state.user?.name.split(" ")[0]}
            </h2>
            <p className="mt-1 text-sm text-cream/65">{state.user?.role === "student" ? t("dash.taglineStudent") : t("dash.tagline")}</p>
            {Object.keys(state.drafts).some((k) => k.startsWith(activeTeam.id + ":")) && (
              <button onClick={() => router.push("/app/journey")}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-gold-400/15 px-3 py-1.5 text-xs font-semibold text-gold-200 transition hover:bg-gold-400/25">
                <Flag size={11} /> {t("dash.backToDraft")}
              </button>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {state.milestones.map((m) => {
                const p = activeTeam.progress[m.id];
                return (
                  <Link key={m.id} href="/app/journey"
                    className={cx(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                      p.status === "reviewed" ? "border-gold-400/50 bg-gold-400/15 text-gold-200" : "border-cream/15 text-cream/60 hover:border-cream/30"
                    )}>
                    {p.status === "reviewed" && <CircleCheck size={12} />}
                    {m.name[state.lang as "en" | "es"]}
                  </Link>
                );
              })}
            </div>
          </div>
          {/* the one-question dashboard: where am I, what do I do next? */}
          <div className="relative w-full rounded-2xl border border-gold-400/30 bg-gold-400/10 p-4 sm:w-auto sm:min-w-64 sm:max-w-72">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300">
              <Flag size={11} /> {t("dash.nextStep")}
            </div>
            <div className="mt-1.5 font-display text-base leading-snug text-cream">{nextStep}</div>
            <Button variant="gold" size="sm" className="mt-3 w-full" onClick={() => router.push("/app/journey")}>
              {t("dash.continue")} <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </Card>

      {/* mini stats */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label={t("dash.statDone")} value={`${done}/5`} />
        <Stat label={t("dash.statPoints")} value={fmtNum(activeTeam.points)} accent />
        <Stat label={t("dash.statRank")} value={`#${fmtNum(rank)}`} />
      </div>

      {/* teacher view: every team, its stage and its next step */}
      {state.user?.role === "teacher" && (
        <Card className="p-5">
          <SectionHead title={t("dash.teamsTitle")} />
          <div className="grid gap-2 sm:grid-cols-2">
            {myPersistentTeams.map((tm) => {
              const next = state.milestones.find((mm) => tm.progress[mm.id]?.status !== "reviewed");
              return (
                <button key={tm.id}
                  onClick={() => { dispatch({ type: "SET_ACTIVE_TEAM", id: tm.id }); }}
                  className={cx(
                    "rounded-2xl border p-4 text-left transition hover:border-gold-500/60",
                    tm.id === activeTeam.id ? "border-gold-500 bg-gold-400/10 shadow-luxe" : "border-hairline bg-paper"
                  )}>
                  <div className="flex items-center gap-3">
                    <Avatar name={tm.name} hue={tm.hue} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-ink">{tm.name}</div>
                      <div className="mt-1 flex gap-1">
                        {state.milestones.map((mm) => (
                          <span key={mm.id} className={cx("h-1.5 flex-1 rounded-full",
                            tm.progress[mm.id]?.status === "reviewed" ? "bg-gold-500" : mm.id === next?.id ? "bg-pine-600" : "bg-ink/10")} />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm font-bold gold-text">{fmtNum(tm.points)}</div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] font-semibold text-ink-2/80">
                    <span className="line-clamp-1">{nextActionFor(tm, state.drafts, state.milestones, state.lang, t)}</span>
                    {next && <span className="shrink-0 text-ink-2/50">{t("dash.nextDeadline")} {fmtDate(next.due).slice(0, 6)}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* feedback */}
        <Card className="p-5">
          <SectionHead kicker="Judge" title={t("dash.recentFeedback")} />
          {lastFeedback ? (
            <div className="rounded-xl border border-gold-500/30 bg-gold-400/10 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gold-700"><Sparkles size={13} /> {t("j.judgeFeedback")}</div>
              <p className="mt-2 text-sm leading-relaxed text-ink">“{lastFeedback.feedback}”</p>
            </div>
          ) : (
            <EmptyState title={t("c.emptyTitle")} body={t("dash.noFeedback")} />
          )}
        </Card>

        {/* leaderboard */}
        <Card className="p-5">
          <SectionHead title={t("dash.leaderboard")} action={<Link href="/app/journey" className="text-xs font-bold text-pine-700 hover:underline">{t("c.viewAll")}</Link>} />
          <div className="space-y-1">
            {board.map((tm, i) => (
              <div key={tm.id} className={cx(
                "flex items-center gap-3 rounded-xl px-2.5 py-2",
                tm.id === activeTeam.id ? "border border-gold-500/50 bg-gold-400/10" : ""
              )}>
                <span className={cx("w-6 text-center font-display text-sm font-semibold", i < 3 ? "gold-text" : "text-ink-2/50")}>{i + 1}</span>
                <Avatar name={tm.name} hue={tm.hue} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{tm.name}</div>
                  <div className="text-[11px] text-ink-2/60">{tm.country}</div>
                </div>
                <div className="text-sm font-bold text-ink">{fmtNum(tm.points)} <span className="text-[10px] font-semibold text-ink-2/60">{t("c.pts")}</span></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* quick actions + announcements */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <SectionHead title={t("dash.quickActions")} />
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: Send, label: t("dash.qaSubmit"), href: "/app/journey" },
              { icon: Download, label: t("dash.qaTemplates"), href: "/app/resources" },
              { icon: MessageSquare, label: t("dash.qaMentor"), href: "/app/messages" },
              { icon: UserPlus, label: t("dash.qaInvite"), href: "/app/team" },
            ].map((a) => (
              <Link key={a.label} href={a.href}
                className="flex items-center gap-2.5 rounded-xl border border-hairline bg-paper px-3.5 py-3 text-sm font-semibold text-ink transition hover:border-gold-500/50 hover:bg-cream">
                <a.icon size={16} className="text-pine-700" /> {a.label}
              </Link>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <SectionHead title={t("dash.announcements")} kicker="TAMTF" />
          <div className="space-y-3">
            {state.announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400/20 text-gold-700"><Megaphone size={14} /></span>
                <div>
                  <div className="text-sm font-semibold text-ink">{a.title}</div>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-2/80">{a.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- reviewer ---------- */

function ReviewerHome() {
  const { state, t } = useApp();
  const router = useRouter();
  const pending = state.submissions.filter((s) => s.status === "pending");
  const reviewed = state.submissions.length - pending.length;
  const nextUp = pending[0];
  return (
    <div className="space-y-5">
      <Card className="grain relative overflow-hidden bg-pine-950 p-6 text-cream">
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300">{t("role.reviewer")}</div>
            <h2 className="mt-1 font-display text-2xl font-light sm:text-3xl">{t(greetingKey())}, {state.user?.name.split(" ")[0]}</h2>
            <p className="mt-1 text-sm text-cream/65">{t("dash.revSubtitle")}</p>
            {nextUp && (
              <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-gold-400/15 px-3 py-1.5 text-xs font-semibold text-gold-200">
                <Flag size={11} /> {t("dash.nextStep")}: {nextUp.teamName} — {t("mile." + nextUp.milestone + ".name")}
              </p>
            )}
          </div>
          <Button variant="gold" onClick={() => router.push(pending.length ? `/app/review?open=${pending[0].id}` : "/app/review")}>
            {t("dash.revCta")} <ArrowRight size={15} />
          </Button>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Stat label={t("dash.revPending")} value={String(pending.length)} accent />
        <Stat label={t("dash.revDone")} value={String(reviewed)} />
      </div>
      <Card className="p-5">
        <SectionHead title={t("rv.title")} action={<Button variant="outline" size="sm" onClick={() => router.push("/app/review")}>{t("c.viewAll")}</Button>} />
        <div className="divide-y divide-hairline/60">
          {pending.slice(0, 4).map((s) => (
            <button key={s.id} onClick={() => router.push(`/app/review?open=${s.id}`)}
              className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-paper/60">
              <ClipboardCheck size={16} className="shrink-0 text-gold-600" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink">{s.teamName}</div>
                <div className="text-xs text-ink-2/70">{s.school} · {s.country}</div>
              </div>
              <span className="rounded-full bg-gold-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-700">
                {t("mile." + s.milestone + ".name")}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------- partner ---------- */

function PartnerHome() {
  const { state, t, user, dispatch, toast } = useApp();
  const router = useRouter();
  const myOrg = state.partners.find((p) => p.id === user?.partnerId);
  const myTeams = state.teams.filter((tm) => tm.partnerId === user?.partnerId);
  const students = myTeams.length * 7;
  const atRisk = myTeams.filter((tm) => tm.stage <= 1).slice(0, 4);
  return (
    <div className="space-y-5">
      <Card className="grain relative overflow-hidden bg-pine-950 p-6 text-cream">
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300">{myOrg?.name ?? t("role.partner")}</div>
            <h2 className="mt-1 font-display text-2xl font-light sm:text-3xl">{t(greetingKey())}, {state.user?.name.split(" ")[0]}</h2>
            <p className="mt-1 text-sm text-cream/65">{t("p.subtitle")}</p>
          </div>
          <Button variant="gold" onClick={() => router.push("/app/partner")}>
            {t("nav.org")} <ArrowRight size={15} />
          </Button>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t("dash.pkSchools")} value={fmtNum(myOrg?.schools ?? 0)} />
        <Stat label={t("dash.pkTeams")} value={fmtNum(myTeams.length)} accent />
        <Stat label={t("dash.pkStudents")} value={fmtNum(students)} />
        <Stat label={t("dash.pkCountries")} value="1" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <SectionHead title={t("dash.byRegion")} />
          <Bars data={REGION_STATS.map((r) => ({ label: r.region, value: r.teams }))} formatValue={(v) => `${fmtNum(v)} ${t("c.teams")}`} />
        </Card>
        <Card className="p-5">
          <SectionHead title={t("dash.trend")} />
          <Trend points={TREND12} />
        </Card>
      </div>

      {/* at-risk teams: silent for 4+ weeks before milestone 2 */}
      <Card className="p-5">
        <SectionHead title={t("dash.atRisk")} kicker={t("dash.atRiskHint")} />
        <div className="space-y-2">
          {atRisk.length === 0 && <p className="py-6 text-center text-sm text-ink-2/70">{t("c.emptyBody")}</p>}
          {atRisk.map((tm) => (
            <div key={tm.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-clay-500/25 bg-clay-500/5 p-3.5">
              <Avatar name={tm.name} hue={tm.hue} size={34} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink">{tm.name}</div>
                <div className="text-[11px] text-ink-2/70">{tm.school} · {tm.country}</div>
              </div>
              <span className="rounded-full bg-clay-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-clay-600">
                {t("p.stageOf")} {tm.stage}/5
              </span>
              <Button variant="outline" size="sm"
                onClick={() => { dispatch({ type: "RECEIVE_MESSAGE", threadId: "th-3", author: `${myOrg?.name ?? "Partner"}`, body: `Nudge → ${tm.name}: keep going — templates are in Resources!`, at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }); toast(t("dash.nudged"), "success"); }}>
                <Flag size={12} /> {t("dash.nudge")}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------- admin ---------- */

function AdminHome() {
  const { state, t } = useApp();
  const router = useRouter();
  const pending = state.submissions.filter((s) => s.status === "pending").length;
  return (
    <div className="space-y-5">
      <Card className="grain relative overflow-hidden bg-pine-950 p-6 text-cream">
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300">{t("role.admin")}</div>
            <h2 className="mt-1 font-display text-2xl font-light sm:text-3xl">{t(greetingKey())}, {state.user?.name.split(" ")[0]}</h2>
            <p className="mt-1 text-sm text-cream/65">{t("a.title")}</p>
          </div>
          <Button variant="gold" onClick={() => router.push("/app/admin")}>
            {t("dash.goAdmin")} <ArrowRight size={15} />
          </Button>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t("dash.aUsers")} value={fmtNum(28412)} />
        <Stat label={t("dash.aSubmissions")} value={fmtNum(9620)} accent />
        <Stat label={t("dash.aPending")} value={fmtNum(pending)} />
        <Stat label={t("dash.aOrgs")} value={String(state.partners.length)} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <SectionHead title={t("dash.trend")} />
          <Trend points={TREND12} />
        </Card>
        <Card className="p-5">
          <SectionHead title={t("dash.latestUsers")} />
          <div className="space-y-2">
            {state.adminUsers.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <Avatar name={u.name} hue={u.name.charCodeAt(0) * 7} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{u.name}</div>
                  <div className="text-[11px] text-ink-2/60">{u.country} · {t("role." + u.role)}</div>
                </div>
                <div className="text-[11px] text-ink-2/50">{u.joined}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useApp();
  if (!user) return null;
  if (user.role === "reviewer") return <ReviewerHome />;
  if (user.role === "partner") return <PartnerHome />;
  if (user.role === "admin") return <AdminHome />;
  return <TeacherHome />;
}
