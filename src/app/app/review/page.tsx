"use client";

/* Judge workspace — a fast queue built for phones:
   pick a submission, score 5 rubric criteria, write feedback, approve or
   return it. Scores flow straight back to the team's Journey page. */

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, CheckCircle2, ClipboardCheck, Download, Eye, FileText, RotateCcw, Search, Send,
} from "lucide-react";
import { useApp } from "@/lib/store";
import type { Submission } from "@/lib/types";
import { Avatar, Button, Card, cx, EmptyState, Field, Modal, ScoreBars, Select, Tabs, Textarea } from "@/components/ui";
import { downloadText, dummyDoc, fmtDate } from "@/lib/utils";

type Filter = "all" | "mine" | "pending" | "done";

export default function ReviewPage() {
  const { state, t, dispatch, toast, user, lang } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const [milestone, setMilestone] = useState("-1");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<number[]>([7, 7, 7, 7, 7]);
  const [feedback, setFeedback] = useState("");
  const [preview, setPreview] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // deep-link support: /app/review?open=sub-demo (used by the dashboard)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("open");
    if (id) setSelected(id);
  }, []);

  const list = useMemo(() => {
    return state.submissions.filter((s) => {
      if (filter === "mine" && s.assignee !== user?.name) return false;
      if (filter === "pending" && s.status !== "pending") return false;
      if (filter === "done" && s.status === "pending") return false;
      if (milestone !== "-1" && s.milestone !== Number(milestone)) return false;
      if (q && !`${s.teamName} ${s.school} ${s.country}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [state.submissions, filter, milestone, q, user]);

  // desktop auto-selects the first row; on phones the detail opens only after a tap
  const explicit = list.find((s) => s.id === selected);
  const sub: Submission | undefined = explicit ?? list[0];

  /** this submission's rubric — configured per milestone by admins (5.4) */
  const rubric = useMemo(
    () => state.milestones.find((m) => m.id === sub?.milestone)?.rubric ?? [],
    [state.milestones, sub?.milestone]
  );
  const rubricLabels = rubric.map((r) => r.labels[lang]);

  useEffect(() => {
    // reset scores when opening another submission (sized to its milestone rubric)
    if (sub) {
      const size = state.milestones.find((m) => m.id === sub.milestone)?.rubric.length ?? 5;
      setCriteria(sub.criteria ?? Array.from({ length: size }, () => 7));
      setFeedback(sub.feedback ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sub?.id]);

  const overall = criteria.length ? Math.round(criteria.reduce((a, b) => a + b, 0) / criteria.length * 10) : 0;

  const decide = (decision: "approved" | "returned") => {
    if (!sub) return;
    if (decision === "returned" && feedback.trim().length < 8) {
      toast(t("rv.needComment"), "error");
      return;
    }
    const notifTitle = `${sub.teamName} · ${t("mile." + sub.milestone + ".name")}`;
    const notifBody = decision === "approved"
      ? `${t("j.yourScore")}: ${overall}/100. ${feedback}`
      : feedback;
    dispatch({ type: "SCORE_SUBMISSION", id: sub.id, criteria, feedback, reviewer: user?.name ?? "Reviewer", decision, notifTitle, notifBody });
    toast(decision === "approved" ? t("rv.approvedToast") : t("rv.returnedToast"), decision === "approved" ? "success" : "info");
    const next = list.find((s) => s.id !== sub.id && s.status === "pending");
    setSelected(next?.id ?? null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tabs<Filter> value={filter} onChange={setFilter} options={[
          { id: "all", label: t("rv.fAll") },
          { id: "mine", label: t("rv.mine") },
          { id: "pending", label: t("rv.fPending") },
          { id: "done", label: t("rv.fDone") },
        ]} />
        <Select value={milestone} onChange={(e) => setMilestone(e.target.value)} className="w-auto">
          <option value="-1">{t("c.all")}</option>
          {state.milestones.map((m) => <option key={m.id} value={m.id}>{m.name[state.lang]}</option>)}
        </Select>
        <div className="relative min-w-40 flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("rv.searchPh")}
            className="w-full rounded-full border border-hairline bg-cream py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold-500" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* queue */}
        <div className="space-y-2">
          {list.length === 0 && <EmptyState title={t("rv.empty")} body={t("rv.emptyHint")} icon={<ClipboardCheck size={28} />} />}
          {list.map((s) => (
            <button key={s.id} onClick={() => setSelected(s.id)}
              className={cx(
                "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition",
                sub?.id === s.id ? "border-gold-500 bg-gold-400/10 shadow-luxe" : "border-hairline bg-cream hover:border-gold-500/40"
              )}>
              <Avatar name={s.teamName} hue={s.teamName.length * 31 % 360} size={42} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-ink">{s.teamName}</span>
                  <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full", s.status === "pending" ? "bg-gold-500 animate-pulse-dot" : s.status === "approved" ? "bg-pine-600" : "bg-clay-500")} />
                </span>
                <span className="block truncate text-xs text-ink-2/70">{s.school} · {s.country}</span>
                <span className="mt-1 inline-flex items-center gap-1.5">
                  <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-2">
                    {t("mile." + s.milestone + ".name")}
                  </span>
                  {s.assignee && (
                    <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-bold",
                      s.assignee === user?.name ? "bg-gold-400/25 text-gold-700" : "bg-pine-100 text-pine-700")}>
                      {s.assignee === user?.name ? t("rv.mineShort") : s.assignee}
                    </span>
                  )}
                </span>
              </span>
              <span className="text-[11px] font-semibold text-ink-2/50">{fmtDate(s.submittedAt).slice(0, 6)}</span>
            </button>
          ))}
        </div>

        {/* detail — overlays the screen on mobile */}
        <div className={cx(explicit ? "block" : "hidden lg:block")}>
          {!sub ? (
            <EmptyState title={t("rv.empty")} body={t("rv.select")} icon={<ClipboardCheck size={28} />} />
          ) : (
            <Card className={cx("p-5 sm:p-6", explicit && "max-lg:fixed max-lg:inset-0 max-lg:z-[60] max-lg:overflow-y-auto max-lg:rounded-none")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button className="rounded-full p-2 hover:bg-ink/5 lg:hidden" onClick={() => setSelected(null)} aria-label={t("c.back")}>
                    <ArrowLeft size={18} />
                  </button>
                  <Avatar name={sub.teamName} hue={sub.teamName.length * 31 % 360} size={48} />
                  <div>
                    <h2 className="font-display text-xl text-ink">{sub.teamName}</h2>
                    <div className="text-xs text-ink-2/70">{t("rv.submittedBy")} {sub.school} · {sub.country}</div>
                  </div>
                </div>
                <span className={cx("rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest",
                  sub.status === "pending" ? "bg-gold-400/20 text-gold-700" : sub.status === "approved" ? "bg-pine-100 text-pine-700" : "bg-clay-500/10 text-clay-600")}>
                  {sub.status === "pending" ? t("rv.pendingTag") : t("rv.doneTag")}
                </span>
              </div>

              {/* evidence: written answers + attached files */}
              <div className="mt-5 rounded-2xl border border-hairline bg-paper p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-2/70">{t("rv.evidence")}</div>
                {sub.answer && (
                  <div className="mt-3">
                    <div className="text-xs font-bold text-ink-2">{t("rv.answer")}</div>
                    <p className="mt-1 whitespace-pre-line rounded-xl bg-cream p-3.5 text-sm leading-relaxed text-ink">{sub.answer}</p>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {(sub.files && sub.files.length > 0 ? sub.files : []).map((f) =>
                    f.thumb ? (
                      <button key={f.id} onClick={() => setPreviewImg(f.thumb!)} className="group relative overflow-hidden rounded-xl border border-hairline" aria-label={t("c.preview")}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.thumb} alt={f.name} className="h-20 w-20 object-cover transition group-hover:scale-105" />
                      </button>
                    ) : (
                      <span key={f.id} className="inline-flex min-w-0 items-center gap-2 rounded-xl bg-cream px-3 py-2 text-sm font-medium text-ink">
                        <FileText size={15} className="shrink-0 text-gold-700" /> <span className="max-w-40 truncate">{f.name}</span>
                      </span>
                    )
                  )}
                  {(!sub.files || sub.files.length === 0) && (
                    <span className="inline-flex min-w-0 items-center gap-2 rounded-xl bg-cream px-3 py-2 text-sm font-medium text-ink">
                      <FileText size={15} className="shrink-0 text-gold-700" /> <span className="truncate">{sub.fileName}</span>
                    </span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPreview(true)}><Eye size={13} /> {t("rv.previewDoc")}</Button>
                  <Button variant="outline" size="sm"
                    onClick={() => { downloadText(sub.fileName.replace(/\.\w+$/, "") + ".txt", dummyDoc(`${t("rv.evidence")} — ${sub.fileName}`, { Team: sub.teamName, School: sub.school, Milestone: t("mile." + sub.milestone + ".name") })); }}>
                    <Download size={13} /> {t("rv.dlEvidence")}
                  </Button>
                </div>
              </div>

              {sub.status === "pending" ? (
                <>
                  {/* rubric */}
                  <div className="mt-6">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-2/70">{t("rv.rubricTitle")}</div>
                        <div className="text-xs text-ink-2/60">{t("rv.sliderHint")}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-3xl font-light gold-text">{overall}</span>
                        <span className="text-xs font-bold text-ink-2"> /100</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-4">
                      {criteria.map((c, i) => (
                        <div key={i}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium text-ink">{rubricLabels[i]}</span>
                            <span className="w-8 text-right font-display text-lg">{c}</span>
                          </div>
                          <input type="range" min={0} max={10} value={c}
                            onChange={(e) => setCriteria(criteria.map((v, j) => (j === i ? Number(e.target.value) : v)))}
                            className="w-full accent-[#c9a44e]"
                            aria-label={rubricLabels[i]} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6">
                    <Field label={t("rv.feedbackLabel")}>
                      <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder={t("rv.feedbackPh")} />
                    </Field>
                  </div>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <Button variant="outline" onClick={() => decide("returned")}>
                      <RotateCcw size={15} /> {t("rv.return")}
                    </Button>
                    <Button variant="gold" onClick={() => decide("approved")}>
                      <Send size={15} /> {t("rv.approve")}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mt-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-pine-700">
                    <CheckCircle2 size={16} /> {t("rv.youScored")}: <span className="font-display text-xl">{sub.score}/100</span>
                  </div>
                  {sub.criteria && <div className="mt-4"><ScoreBars criteria={sub.criteria} labels={rubricLabels} /></div>}
                  {sub.feedback && (
                    <div className="mt-4 rounded-xl border border-gold-500/30 bg-gold-400/10 p-4">
                      <p className="font-display text-[15px] italic leading-relaxed text-ink">“{sub.feedback}”</p>
                    </div>
                  )}
                  {/* audit trail — append-only scoring history (5.4) */}
                  {(sub.history ?? []).length > 0 && (
                    <div className="mt-5">
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-2/70">{t("rv.history")}</div>
                      <div className="mt-2 space-y-2">
                        {[...(sub.history ?? [])].reverse().map((ev) => (
                          <div key={ev.id} className="flex items-start gap-3 rounded-xl border border-hairline bg-paper p-3">
                            <span className={cx("mt-0.5 h-2 w-2 shrink-0 rounded-full", ev.decision === "approved" ? "bg-pine-600" : "bg-clay-500")} />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline gap-x-2 text-xs">
                                <span className="font-bold text-ink">{ev.decision === "approved" ? `${ev.total}/100` : t("rv.return")}</span>
                                <span className="text-ink-2/60">by {ev.by} · {ev.at}</span>
                              </div>
                              {ev.feedback && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-2/80">“{ev.feedback}”</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* document preview modal */}
      <Modal open={preview} onClose={() => setPreview(false)} title={sub?.fileName ?? ""} wide>
        <pre className="whitespace-pre-wrap rounded-xl bg-pine-950 p-5 font-mono text-xs leading-relaxed text-cream/85">
          {sub && dummyDoc(`${t("rv.evidence")} — ${sub.fileName}`, { Team: sub.teamName, School: sub.school, Country: sub.country, Milestone: t("mile." + sub.milestone + ".name"), Submitted: sub.submittedAt })}
        </pre>
      </Modal>

      {/* photo preview modal */}
      <Modal open={!!previewImg} onClose={() => setPreviewImg(null)} title={t("c.preview")} wide>
        {previewImg && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={previewImg} alt="" className="max-h-[70dvh] w-full rounded-xl object-contain" />
        )}
      </Modal>
    </div>
  );
}
