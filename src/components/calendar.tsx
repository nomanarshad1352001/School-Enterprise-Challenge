"use client";

/* Programme calendar — every deadline with a live countdown, shared by all
   five role dashboards so every user sees time pressure the same way. */

import { CalendarDays, Flag } from "lucide-react";
import { useApp } from "@/lib/store";
import { Card, SectionHead, cx } from "@/components/ui";
import { fmtDate } from "@/lib/utils";

const daysLeft = (due: string) => Math.ceil((new Date(due + "T23:59:59").getTime() - Date.now()) / 86400000);

export function ProgrammeCalendar({ dark = false }: { dark?: boolean }) {
  const { state, t, lang } = useApp();
  const entries = state.milestones.map((m) => ({ m, days: daysLeft(m.due) }));
  const next = entries.find((e) => e.days >= 0);
  if (dark) {
    // compact inline strip for dark hero cards
    return (
      <div className="mt-4 flex flex-wrap gap-1.5">
        {entries.map(({ m, days }) => (
          <span key={m.id} className={cx(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold",
            next?.m.id === m.id ? "border-gold-400 bg-gold-400/20 text-gold-200" : "border-cream/15 text-cream/55"
          )}>
            <CalendarDays size={10} />
            {m.name[lang]}
            <span className="font-semibold opacity-80">
              {days < 0 ? "·" : days === 0 ? t("cal.passed") === "Closed" ? "today" : "hoy" : `${days}d`}
            </span>
          </span>
        ))}
      </div>
    );
  }
  return (
    <Card className="p-5">
      <SectionHead title={t("cal.title")} kicker={t("cal.hint")} />
      <div className="space-y-2">
        {entries.map(({ m, days }) => {
          const isNext = next?.m.id === m.id;
          return (
            <div key={m.id} className={cx(
              "flex items-center gap-3 rounded-xl border p-3",
              isNext ? "border-gold-500/60 bg-gold-400/10" : "border-hairline bg-paper"
            )}>
              <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                isNext ? "bg-gold-400 text-ink" : days < 0 ? "bg-ink/5 text-ink/30" : "bg-pine-100 text-pine-700")}>
                <CalendarDays size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-ink">{m.name[lang]}</div>
                <div className="text-[11px] font-semibold text-ink-2/60">{fmtDate(m.due)}</div>
              </div>
              {isNext && (
                <span className="rounded-full bg-gold-400/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-gold-700">
                  <Flag size={8} className="mr-1 inline" />{t("cal.next")}
                </span>
              )}
              <span className={cx("text-sm font-bold", days < 0 ? "text-ink/35" : days <= 7 ? "text-clay-600" : "text-ink")}>
                {days < 0 ? t("cal.passed") : days === 0 ? t("cal.dueToday") : `${days} ${t("cal.daysLeft")}`}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
