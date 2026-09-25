"use client";

/* Messages — team chat, mentor chat and TAMTF support.
   Replies are simulated locally so the demo feels alive; the banner keeps
   the safeguarding rule ("chats are monitored") visible at all times. */

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Flag, Search, Send, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/store";
import { Avatar, cx } from "@/components/ui";
import { moderationHit } from "@/lib/utils";

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessagesPage() {
  const { state, t, dispatch, toast } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const botTimers = useRef<number[]>([]);

  const threads = state.threads.filter((th) => th.title.toLowerCase().includes(q.toLowerCase()));
  const open = state.threads.find((th) => th.id === openId) ?? null;

  // mark read + scroll to bottom whenever a thread opens or grows
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    if (open && open.unread > 0) dispatch({ type: "MARK_THREAD_READ", threadId: open.id });
  }, [openId, open?.messages.length]);

  useEffect(() => () => botTimers.current.forEach((id) => window.clearTimeout(id)), []);

  const send = () => {
    const body = draft.trim();
    if (!body || !open) return;
    // auto-moderation (Section 10): flagged messages still send, but go to the safety queue
    if (moderationHit(body)) {
      dispatch({ type: "REPORT_MESSAGE", threadId: open.id, threadTitle: open.title, author: state.user?.name ?? "Me", body, reporter: "Auto-moderation", at: nowTime() });
      toast(t("m.flaggedAuto"), "info");
    }
    dispatch({ type: "SEND_MESSAGE", threadId: open.id, body, at: nowTime() });
    setDraft("");
    toast(t("t.sent"), "success");
    // simulated mentor reply — localized canned line from the bot pool
    const pool = [t("m.bot1"), t("m.bot2"), t("m.bot3")];
    const reply = pool[Math.floor(Math.random() * pool.length)];
    const timer = window.setTimeout(() => {
      dispatch({ type: "RECEIVE_MESSAGE", threadId: open.id, body: reply, author: open.title.split("—")[0].trim(), at: nowTime() });
    }, 1400);
    botTimers.current.push(timer);
  };

  return (
    <div className="grid gap-4 lg:h-[calc(100dvh-10.5rem)] lg:grid-cols-[320px_1fr]">
      {/* thread list */}
      <div className={cx("flex-col gap-2", open ? "hidden lg:flex" : "flex")}>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("m.searchPh")}
            className="w-full rounded-full border border-hairline bg-cream py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold-500" />
        </div>
        {threads.map((th) => {
          const last = th.messages[th.messages.length - 1];
          return (
            <button key={th.id} onClick={() => setOpenId(th.id)}
              className={cx(
                "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition",
                open?.id === th.id ? "border-gold-500 bg-gold-400/10 shadow-luxe" : "border-hairline bg-cream hover:border-gold-500/40"
              )}>
              <Avatar name={th.title} hue={th.hue} size={46} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-bold text-ink">{th.title}</span>
                  <span className="shrink-0 text-[10px] font-semibold text-ink-2/50">{last?.at}</span>
                </span>
                <span className="block truncate text-xs text-ink-2/75">{last?.body}</span>
              </span>
              {th.unread > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gold-500 px-1.5 text-[10px] font-bold text-ink">{th.unread}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* chat pane */}
      <div className={cx(
        "flex-col overflow-hidden rounded-2xl border border-hairline bg-cream shadow-luxe",
        open ? "flex max-lg:fixed max-lg:inset-0 max-lg:z-[60] max-lg:rounded-none" : "hidden lg:flex"
      )}>
        {open ? (
          <>
            {/* header */}
            <div className="flex items-center gap-3 border-b border-hairline bg-paper px-4 py-3">
              <button className="rounded-full p-2 hover:bg-ink/5 lg:hidden" onClick={() => setOpenId(null)} aria-label={t("c.back")}>
                <ArrowLeft size={18} />
              </button>
              <Avatar name={open.title} hue={open.hue} size={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-ink">{open.title}</div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-pine-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-pine-600" /> {t("m.online")} · {open.subtitle}
                </div>
              </div>
            </div>

            {/* safeguarding banner — always visible */}
            <div className="flex items-center gap-2 border-b border-hairline bg-gold-400/10 px-4 py-2 text-[11px] font-semibold text-gold-700">
              <ShieldCheck size={13} className="shrink-0" /> {t("m.safeguard")}
            </div>

            {/* messages */}
            <div ref={scrollRef} className="thin-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {open.messages.map((m) => {
                const alreadyFlagged = state.flags.some((f) => !f.resolved && f.threadId === open.id && f.body === m.body);
                const report = () => {
                  if (alreadyFlagged) { toast(t("m.alreadyReported"), "info"); return; }
                  dispatch({
                    type: "REPORT_MESSAGE", threadId: open.id, threadTitle: open.title,
                    author: m.author, body: m.body, reporter: state.user?.name ?? "User", at: nowTime(),
                  });
                  toast(t("m.reported"), "info");
                };
                return (
                  <div key={m.id} className={cx("group flex items-end gap-1.5", m.mine ? "justify-end" : "justify-start")}>
                    <div className={cx(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                      m.mine ? "rounded-br-md bg-pine-800 text-cream" : "rounded-bl-md border border-hairline bg-paper text-ink"
                    )}>
                      {!m.mine && <div className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-gold-700">{m.author}</div>}
                      {m.body}
                      <div className={cx("mt-1 flex items-center justify-end gap-1 text-[9px] font-semibold", m.mine ? "text-cream/50" : "text-ink-2/50")}>
                        {m.at}
                      </div>
                    </div>
                    {/* report to safeguarding — always reachable on touch screens */}
                    {!m.mine && (
                      <button onClick={report} aria-label={t("m.report")} title={t("m.report")}
                        className={cx("mb-1 rounded-full p-1.5 transition",
                          alreadyFlagged ? "text-clay-500" : "text-ink/25 hover:bg-clay-500/10 hover:text-clay-600 sm:opacity-0 sm:group-hover:opacity-100")}>
                        <Flag size={13} fill={alreadyFlagged ? "currentColor" : "none"} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* composer */}
            <form className="flex items-end gap-2 border-t border-hairline bg-paper p-3"
              onSubmit={(e) => { e.preventDefault(); send(); }}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={t("m.typePh")}
                rows={1}
                className="max-h-28 flex-1 resize-none rounded-2xl border border-hairline bg-cream px-4 py-3 text-sm outline-none focus:border-gold-500"
                aria-label={t("m.typePh")}
              />
              <button type="submit" disabled={!draft.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-400 text-ink shadow-luxe transition hover:bg-gold-300 disabled:opacity-40"
                aria-label={t("c.send")}>
                <Send size={17} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-ink-2/70">{t("m.empty")}</div>
        )}
      </div>
    </div>
  );
}
