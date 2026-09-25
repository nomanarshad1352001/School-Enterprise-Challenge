"use client";

/* The Journey — the single most important page for teams.
   - A prominent horizontal stepper answers "where am I?" at a glance
   - Milestones are data-driven (name/guidance/deadline/accepted evidence types)
   - Submissions: written answers + photo/document uploads
   - Drafts AUTOSAVE while typing (nothing is lost on a dropped connection)
   - Images are compressed in the browser before upload (3G-friendly)
   - Returned submissions can be improved and resubmitted */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, CheckCircle2, ChevronRight, CirclePlay, Clock3, Coins, Download,
  FileImage, FileText, Lock, RotateCcw, Save, Send, UploadCloud, X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import type { MilestoneProgress, MilestoneStatus, SubFile } from "@/lib/types";
import { Button, Card, cx, Modal, ScoreBars, StatusPill } from "@/components/ui";
import { Donut } from "@/components/charts";
import { compressImage, downloadText, dummyDoc, fmtDate, fmtSize, kindOfFile, moderationHit, uid } from "@/lib/utils";

const MAX_FILES = 6;

/** effective status incl. drafts: an open milestone with a saved draft shows "draft" */
function effStatus(id: number, stage: number, p: MilestoneProgress, hasDraft: boolean): MilestoneStatus {
  if (p.status === "locked" && id <= stage) return hasDraft ? "draft" : "open";
  if (p.status === "open" && hasDraft) return "draft";
  return p.status;
}

const stepStyle: Record<MilestoneStatus, string> = {
  locked: "border-hairline bg-paper text-ink/30",
  open: "border-sky-500/50 bg-sky-500/10 text-sky-500",
  draft: "border-plum-500/50 bg-plum-500/10 text-plum-500",
  awaiting_teacher: "border-gold-500/60 bg-gold-400/20 text-gold-700",
  submitted: "border-gold-500/60 bg-gold-400/20 text-gold-700",
  reviewed: "border-gold-400 bg-gold-400 text-ink",
  returned: "border-clay-500/60 bg-clay-500/10 text-clay-600",
};

export default function JourneyPage() {
  const { state, t, lang, myPersistentTeams, activeTeam, totalPoints, dispatch, toast } = useApp();

  // current position in the journey = first unfinished milestone (array order)
  const currentIdx = useMemo(() => {
    const i = state.milestones.findIndex((m) => {
      const s = effStatus(m.id, activeTeam.stage, activeTeam.progress[m.id], !!state.drafts[`${activeTeam.id}:${m.id}`]);
      return s !== "reviewed";
    });
    return i === -1 ? state.milestones.length - 1 : i;
  }, [state.milestones, activeTeam, state.drafts]);

  const [selIdx, setSelIdx] = useState(currentIdx);
  useEffect(() => setSelIdx(currentIdx), [activeTeam.id, currentIdx]);

  const m = state.milestones[Math.min(selIdx, state.milestones.length - 1)];
  const draftKey = `${activeTeam.id}:${m.id}`;
  const storedDraft = state.drafts[draftKey];
  const status = effStatus(m.id, activeTeam.stage, activeTeam.progress[m.id], !!storedDraft);
  const editable = status === "open" || status === "draft" || status === "returned";

  /* ---------- local editing state (mirrors the stored draft) ---------- */
  const [text, setText] = useState(storedDraft?.text ?? "");
  const [atts, setAtts] = useState<SubFile[]>(storedDraft?.attachments ?? []);
  const [loadedFor, setLoadedFor] = useState(draftKey);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // swap in the stored draft when team / milestone / underlying data changes
  useEffect(() => {
    if (loadedFor !== draftKey) {
      const s = state.drafts[draftKey];
      setText(s?.text ?? "");
      setAtts(s?.attachments ?? []);
      setLoadedFor(draftKey);
    }
  }, [draftKey, loadedFor, state.drafts]);

  const sameAtts = (a: SubFile[], b?: SubFile[]) =>
    a.length === (b?.length ?? 0) && a.every((x, i) => b?.[i]?.id === x.id);
  const dirty = loadedFor === draftKey && (text !== (storedDraft?.text ?? "") || !sameAtts(atts, storedDraft?.attachments));

  // autosave on a short debounce — survives dropped connections
  useEffect(() => {
    if (!dirty) return;
    const id = window.setTimeout(() => {
      dispatch({ type: "SAVE_DRAFT", teamId: activeTeam.id, milestone: m.id, draft: { text, attachments: atts, savedAt: new Date().toISOString() } });
    }, 700);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, atts, dirty]);

  const onFiles = async (list: FileList | null) => {
    if (!list) return;
    setBusy(true);
    try {
      const room = MAX_FILES - atts.length;
      for (const file of Array.from(list).slice(0, Math.max(0, room))) {
        const kind = kindOfFile(file);
        if (kind === "image") {
          const c = await compressImage(file, 480, 0.62);
          setAtts((a) => [...a, { id: uid("f"), name: file.name, kind, size: c.bytes, origSize: file.size, thumb: c.dataUrl }]);
        } else {
          setAtts((a) => [...a, { id: uid("f"), name: file.name, kind: "document", size: file.size, origSize: file.size }]);
        }
      }
      if (list.length > room && room <= 0) toast(t("j.maxFiles"), "info");
    } catch {
      toast("Could not process that file", "error");
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    if (!text.trim() && atts.length === 0) {
      toast(t("j.submitNeed"), "error");
      return;
    }
    const fileName = atts[0]?.name ?? `${m.name.en.replace(/\s+/g, "-").toLowerCase()}-answers.txt`;
    // auto-moderation: free text is scanned before the file reaches reviewers
    if (moderationHit(text)) {
      dispatch({ type: "REPORT_MESSAGE", threadId: "journey", threadTitle: `${activeTeam.name} · ${m.name.en}`, author: state.user?.name ?? "Student", body: text.slice(0, 220), reporter: "Auto-moderation", at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
      toast(t("m.flaggedAuto"), "info");
    }
    dispatch({ type: "SUBMIT_EVIDENCE", teamId: activeTeam.id, milestone: m.id, fileName, files: atts, answer: text.trim() || undefined });
    toast(t("t.submitted"), "success");
    setText(""); setAtts([]);
  };

  const downloadTpl = (kind: string) => {
    downloadText(`SEC-${m.name.en.replace(/\s+/g, "-")}-${kind}.txt`,
      dummyDoc(`${m.name.en} — ${kind}`, { Team: activeTeam.name, School: activeTeam.school, Year: "2025/26" }));
  };

  const doneCount = state.milestones.filter((mm) => activeTeam.progress[mm.id]?.status === "reviewed").length;

  return (
    <div className="space-y-6">
      {/* intro + team switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-light tracking-tight text-ink md:hidden">{t("j.title")}</h1>
          <p className="mt-1 text-sm text-ink-2">{t("j.intro")}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {myPersistentTeams.map((tm) => (
            <button key={tm.id} onClick={() => dispatch({ type: "SET_ACTIVE_TEAM", id: tm.id })}
              className={cx("rounded-full border px-3 py-1.5 text-xs font-bold transition",
                tm.id === activeTeam.id ? "border-gold-500 bg-gold-400/15 text-gold-700" : "border-hairline text-ink-2 hover:border-gold-500/40")}>
              {tm.name}
            </button>
          ))}
        </div>
      </div>

      {/* -----------------------------------------------
          THE STEPPER — the single most prominent element
         ----------------------------------------------- */}
      <Card className="grain relative overflow-hidden bg-pine-950 px-4 py-6 text-cream sm:px-6">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gold-400/15 blur-3xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-300">{t("j.stepper")}</div>
            <div className="mt-1 font-display text-2xl font-light">{activeTeam.name}</div>
          </div>
          <Donut value={doneCount} max={5} size={76} stroke={8} invert label={`${doneCount}/5`} sub={t("dash.statDone")} />
        </div>

        <div className="no-scrollbar relative mt-6 overflow-x-auto pb-1" role="list" aria-label={t("j.stepper")}>
          <div className="relative flex min-w-[34rem] items-start">
            {/* track line */}
            <div aria-hidden className="absolute left-0 right-0 top-6 h-px bg-cream/15" />
            <div aria-hidden className="absolute left-0 top-6 h-px bg-gradient-to-r from-gold-600 to-gold-300 transition-all duration-700"
              style={{ width: `${(doneCount / 5) * 100}%` }} />
            {state.milestones.map((mm, i) => {
              const p = activeTeam.progress[mm.id];
              const s = effStatus(mm.id, activeTeam.stage, p, !!state.drafts[`${activeTeam.id}:${mm.id}`]);
              const isCurrent = i === currentIdx;
              const isSel = i === selIdx;
              return (
                <button key={mm.id} role="listitem" onClick={() => setSelIdx(i)}
                  aria-current={isCurrent ? "step" : undefined}
                  className="group relative z-10 flex flex-1 flex-col items-center gap-2 px-1">
                  <span className={cx(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 font-display text-base transition-all duration-300",
                    stepStyle[s],
                    isSel && "ring-4 ring-gold-400/25",
                    isCurrent && s !== "reviewed" && "scale-110"
                  )} style={s === "reviewed" ? {} : {}}>
                    {s === "locked" ? <Lock size={15} /> :
                      s === "reviewed" ? <CheckCircle2 size={20} /> :
                      s === "returned" ? <RotateCcw size={16} /> :
                      s === "draft" ? <Save size={16} /> :
                      <span className="font-bold">{i + 1}</span>}
                  </span>
                  <span className={cx(
                    "max-w-28 text-center text-[11px] font-semibold leading-tight transition",
                    isSel ? "text-gold-300" : "text-cream/55 group-hover:text-cream/85"
                  )}>
                    {mm.name[lang]}
                  </span>
                  {isCurrent && <span className="absolute -top-2 h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gold-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ---------- selected milestone detail ---------- */}
      <Card className={cx("overflow-hidden transition", status === "locked" && "opacity-75")}>
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline p-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-2xl font-light text-ink">{m.name[lang]}</h2>
              <StatusPill status={status} label={t("st." + status)} />
            </div>
            <p className="mt-1 text-sm text-ink-2/85">{m.blurb[lang]}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold uppercase tracking-widest text-ink-2/60">
              <span className="inline-flex items-center gap-1"><Clock3 size={11} /> {t("j.dueLabel")} {fmtDate(m.due)}</span>
              <span className="inline-flex items-center gap-1"><Coins size={11} className="text-gold-600" /> {t("j.pointsLabel")} {m.points} {t("c.pts")}</span>
            </div>
          </div>
          {m.points > 0 && status === "reviewed" && activeTeam.progress[m.id]?.score !== undefined && (
            <div className="text-right">
              <div className="font-display text-4xl gold-text">{activeTeam.progress[m.id].score}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink-2/60">/100</div>
            </div>
          )}
        </div>

        <div className="p-5">
          {/* locked */}
          {status === "locked" && (
            <p className="flex items-center gap-2 rounded-xl bg-paper p-4 text-sm text-ink-2">
              <Lock size={14} /> {t("j.lockedBody")}
            </p>
          )}

          {/* editable states: open / draft / returned */}
          {editable && (
            <div className="space-y-6">
              {status === "returned" && activeTeam.progress[m.id]?.feedback && (
                <div className="flex items-start gap-3 rounded-xl border border-clay-500/30 bg-clay-500/10 p-4">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-clay-600" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-clay-600">{t("j.judgeFeedback")}</div>
                    <p className="mt-1 text-sm leading-relaxed text-ink">“{activeTeam.progress[m.id].feedback}”</p>
                    <p className="mt-2 text-xs font-semibold text-ink-2">{t("j.resubmitHint")}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-5 lg:grid-cols-2">
                {/* guidance */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-2/70">{t("j.guidance")}</div>
                  <div className="mt-2 whitespace-pre-line rounded-2xl border border-pine-200 bg-pine-50 p-4 text-sm leading-relaxed text-ink">{m.guidance[lang]}</div>
                  {m.video && (
                    <a href={m.video} target="_blank" rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-pine-700 hover:underline">
                      <CirclePlay size={16} /> {t("j.watchVideo")} ↗
                    </a>
                  )}
                  <div className="mt-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-2/70">{t("j.required")}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.accepts.map((k) => (
                        <span key={k} className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/15 px-3 py-1.5 text-xs font-bold text-gold-700">
                          {k === "image" ? <FileImage size={12} /> : k === "video" ? <CirclePlay size={12} /> : <FileText size={12} />}
                          {t(k === "image" ? "j.typeImage" : k === "video" ? "j.typeVideo" : "j.typeDocument")}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {["j.tplPlan", "j.tplGuide", "j.tplExample"].map((k) => (
                      <Button key={k} variant="outline" size="sm" onClick={() => downloadTpl(t(k))}>
                        <Download size={13} /> {t(k)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* work area: text + attachments */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-2/70">{t("j.textAnswer")}</div>
                      {storedDraft && !dirty && (
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-plum-500">
                          <Save size={11} /> {t("j.draftSaved")} · {new Date(storedDraft.savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={t("j.textPh")}
                      rows={6}
                      className="mt-2 min-h-36 w-full resize-y rounded-xl border border-hairline bg-cream px-3.5 py-2.5 text-sm leading-relaxed outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-2/70">{t("j.attachments")} ({atts.length}/{MAX_FILES})</div>
                    </div>
                    <input ref={fileRef} type="file" multiple className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
                      onChange={(e) => { void onFiles(e.target.files); e.target.value = ""; }} />
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={busy || atts.length >= MAX_FILES}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-hairline bg-paper px-4 py-5 text-sm font-semibold text-ink-2 transition hover:border-gold-500/60 hover:bg-gold-400/5 disabled:opacity-50"
                    >
                      <UploadCloud size={18} className="text-gold-600" />
                      {busy ? "Compressing…" : t("j.addFiles")}
                    </button>
                    <p className="mt-1.5 text-[11px] text-ink-2/60">{t("j.uploadHint")}</p>

                    {atts.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {atts.map((f) => (
                          <li key={f.id} className="flex items-center gap-2.5 rounded-xl border border-hairline bg-cream p-2.5">
                            {f.thumb ? (
                              <button onClick={() => setPreviewImg(f.thumb!)} className="shrink-0" aria-label={t("c.preview")}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={f.thumb} alt={f.name} className="h-10 w-10 rounded-lg object-cover" />
                              </button>
                            ) : (
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pine-100 text-pine-700"><FileText size={16} /></span>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-semibold text-ink">{f.name}</div>
                              <div className="text-[10px] text-ink-2/60">
                                {fmtSize(f.size)}
                                {f.origSize !== undefined && f.origSize > f.size && (
                                  <span className="ml-1 text-pine-700">({fmtSize(f.origSize)} → {t("j.compressed")})</span>
                                )}
                              </div>
                            </div>
                            <button onClick={() => setAtts(atts.filter((x) => x.id !== f.id))} className="rounded-full p-1.5 text-ink-2/60 hover:bg-clay-500/10 hover:text-clay-600" aria-label={t("c.remove")}>
                              <X size={13} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <Button variant="gold" className="w-full" onClick={submit}
                    disabled={!text.trim() && atts.length === 0}>
                    <Send size={15} /> {status === "returned" ? t("j.resubmit") : t("j.submitFor")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Section 10: student work waits for the teacher's approval first */}
          {status === "awaiting_teacher" && (
            <div className="flex flex-col gap-3 rounded-xl border border-gold-500/30 bg-gold-400/10 p-4">
              <div className="flex items-start gap-3">
                <Clock3 size={16} className="mt-0.5 shrink-0 text-gold-700" />
                <div>
                  <div className="text-sm font-bold text-ink">{t("j.waitTeacher")}</div>
                  <p className="mt-0.5 text-sm text-ink-2">
                    {state.user?.role === "teacher" ? t("j.waitTeacherTeacher") : t("j.waitTeacherStudent")}
                  </p>
                </div>
              </div>
              {state.user?.role === "teacher" && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="gold" className="flex-1" onClick={() => { dispatch({ type: "APPROVE_MILESTONE", teamId: activeTeam.id, milestone: m.id }); toast(t("j.approvedToast"), "success"); }}>
                    <CheckCircle2 size={15} /> {t("j.approveTeacher")}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => { dispatch({ type: "SEND_BACK", teamId: activeTeam.id, milestone: m.id, note: "Teacher: please revise before I approve this for the judges." }); toast(t("j.sentBackToast"), "info"); }}>
                    <RotateCcw size={15} /> {t("j.sendBack")}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* under review */}
          {status === "submitted" && (
            <div className="flex items-start gap-3 rounded-xl border border-gold-500/30 bg-gold-400/10 p-4">
              <Clock3 size={16} className="mt-0.5 shrink-0 text-gold-700" />
              <div className="min-w-0">
                <div className="text-sm font-bold text-ink">{t("j.waitTitle")}</div>
                <p className="mt-0.5 text-sm text-ink-2">{t("j.waitBody")}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {activeTeam.progress[m.id]?.answer && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-cream px-2.5 py-1 text-xs font-medium text-ink-2">
                      <FileText size={12} /> {t("rv.answer")}
                    </span>
                  )}
                  {(activeTeam.progress[m.id]?.files ?? []).map((f) => (
                    <span key={f.id} className="inline-flex items-center gap-1.5 rounded-lg bg-cream px-2.5 py-1 text-xs font-medium text-ink-2">
                      {f.kind === "image" ? <FileImage size={12} /> : <FileText size={12} />} {f.name}
                    </span>
                  ))}
                  <span className="text-xs text-ink-2/60">· {t("j.submittedOn")} {activeTeam.progress[m.id]?.submittedAt && fmtDate(activeTeam.progress[m.id].submittedAt!)}</span>
                </div>
              </div>
            </div>
          )}

          {/* reviewed */}
          {status === "reviewed" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-2/70">{t("j.yourScore")}</div>
                {activeTeam.progress[m.id]?.criteria && (
                  <div className="mt-3">
                    <ScoreBars criteria={activeTeam.progress[m.id].criteria!}
                      labels={m.rubric.map((r) => r.labels[lang])} />
                  </div>
                )}
                {/* audit trail: every scoring round for this milestone */}
                {(() => {
                  const hist = state.submissions
                    .filter((s) => s.teamId === activeTeam.id && s.milestone === m.id)
                    .flatMap((s) => s.history ?? []);
                  return hist.length > 1 && (
                    <div className="mt-4">
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-2/70">{t("rv.history")}</div>
                      <div className="mt-2 space-y-1.5">
                        {[...hist].reverse().map((ev) => (
                          <div key={ev.id} className="flex items-center gap-2 rounded-lg bg-paper px-3 py-2 text-xs">
                            <span className={cx("h-1.5 w-1.5 rounded-full", ev.decision === "approved" ? "bg-pine-600" : "bg-clay-500")} />
                            <span className="font-bold text-ink">{ev.decision === "approved" ? `${ev.total}/100` : t("rv.return")}</span>
                            <span className="text-ink-2/60">· {ev.by} · {ev.at}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setSelIdx(Math.min(selIdx + 1, state.milestones.length - 1))}>
                  {t("c.next")} {state.milestones[selIdx + 1]?.name[lang] ?? ""} <ChevronRight size={14} />
                </Button>
              </div>
              {activeTeam.progress[m.id]?.feedback && (
                <div className="rounded-xl border border-gold-500/30 bg-gold-400/10 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-700">{t("j.judgeFeedback")}</div>
                  <p className="mt-2 font-display text-[15px] italic leading-relaxed text-ink">“{activeTeam.progress[m.id].feedback}”</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* photo preview */}
      <Modal open={!!previewImg} onClose={() => setPreviewImg(null)} title={t("c.preview")} wide>
        {previewImg && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={previewImg} alt="" className="max-h-[70dvh] w-full rounded-xl object-contain" />
        )}
      </Modal>
    </div>
  );
}
