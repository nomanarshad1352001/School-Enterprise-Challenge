"use client";

/* Partner workspace — for organisations like Fundación Emprende that run
   SEC in a whole country. Live filters work across the full 2,400-team
   dataset; exports generate real CSV files in the browser. */

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { Avatar, Button, Card, CodeChip, cx, EmptyState, Modal, ProgressBar, SectionHead, Select, Stat } from "@/components/ui";
import { Bars, Trend } from "@/components/charts";
import { COUNTRIES, REGION_STATS, TREND12 } from "@/lib/mock";
import { downloadText, fmtNum, toCSV } from "@/lib/utils";

const PAGE = 12;

export default function PartnerPage() {
  const { state, t, user, toast } = useApp();
  const [region, setRegion] = useState("all");
  const [country, setCountry] = useState("all");
  const [mineOnly, setMineOnly] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<string | null>(null);

  const myOrg = state.partners.find((p) => p.id === user?.partnerId);

  const filtered = useMemo(() => {
    return state.teams.filter((tm) => {
      if (mineOnly && user?.partnerId && tm.partnerId !== user.partnerId) return false;
      if (region !== "all" && tm.region !== region) return false;
      if (country !== "all" && tm.country !== country) return false;
      if (q && !`${tm.name} ${tm.school}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [state.teams, region, country, q, mineOnly, user]);

  // back to page 1 whenever the filters change
  useEffect(() => { setPage(0); }, [region, country, q, mineOnly]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * PAGE, safePage * PAGE + PAGE);
  const detailTeam = filtered.find((tm) => tm.id === detail) ?? state.teams.find((tm) => tm.id === detail);
  const kpis = {
    teams: filtered.length,
    schools: new Set(filtered.map((tm) => tm.school)).size,
    students: filtered.length * 7,
    countries: new Set(filtered.map((tm) => tm.country)).size,
  };

  const exportCsv = () => {
    const csv = toCSV(filtered.map((tm) => ({
      team: tm.name, school: tm.school, country: tm.country, region: tm.region,
      milestone: tm.stage, points: tm.points, teacher: tm.teacherName,
    })));
    downloadText("sec-teams.csv", csv, "text/csv");
    toast(t("t.exported"), "success");
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-700">{myOrg?.name ?? "SEC"}</div>
        <p className="mt-1 text-sm text-ink-2">{t("p.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t("dash.pkTeams")} value={fmtNum(kpis.teams)} accent />
        <Stat label={t("dash.pkSchools")} value={fmtNum(kpis.schools)} />
        <Stat label={t("dash.pkStudents")} value={fmtNum(kpis.students)} />
        <Stat label={t("dash.pkCountries")} value={String(kpis.countries)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <SectionHead title={t("p.regionTitle")} />
          <Bars data={REGION_STATS.map((r) => ({ label: r.region, value: r.teams }))} formatValue={(v) => fmtNum(v)} />
        </Card>
        <Card className="p-5">
          <SectionHead title={t("p.trendTitle")} />
          <Trend points={TREND12} />
        </Card>
      </div>

      {/* filters */}
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-40 flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("p.searchTeams")}
              className="w-full rounded-full border border-hairline bg-paper py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold-500" />
          </div>
          <Select value={region} onChange={(e) => { setRegion(e.target.value); setCountry("all"); }} className="w-40">
            <option value="all">{t("p.filterRegion")}: {t("c.all")}</option>
            {REGION_STATS.map((r) => <option key={r.region} value={r.region}>{r.region}</option>)}
          </Select>
          <Select value={country} onChange={(e) => setCountry(e.target.value)} className="w-40">
            <option value="all">{t("p.filterCountry")}: {t("c.all")}</option>
            {COUNTRIES.filter((c) => region === "all" || c.region === region).map((c) => (
              <option key={c.code} value={c.name}>{c.name}</option>
            ))}
          </Select>
          <button onClick={() => setMineOnly(!mineOnly)} aria-pressed={mineOnly}
            className={cx("rounded-full border px-3.5 py-2.5 text-xs font-bold transition",
              mineOnly ? "border-gold-500 bg-gold-400/15 text-gold-700" : "border-hairline text-ink-2")}>
            {myOrg?.name ?? "My org"}
          </button>
          <Button variant="outline" size="sm" onClick={exportCsv} className="ml-auto">
            <Download size={14} /> {t("p.export")}
          </Button>
        </div>
      </Card>

      {/* table */}
      <Card className="overflow-hidden">
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-150 text-left text-sm">
            <thead>
              <tr className="border-b border-hairline bg-paper/70 text-[11px] font-bold uppercase tracking-widest text-ink-2/70">
                <th className="px-4 py-3">{t("p.colTeam")}</th>
                <th className="px-4 py-3">{t("p.colSchool")}</th>
                <th className="px-4 py-3">{t("p.colCountry")}</th>
                <th className="px-4 py-3">{t("p.colStage")}</th>
                <th className="px-4 py-3 text-right">{t("p.colPoints")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline/60">
              {pageRows.map((tm) => (
                <tr key={tm.id} onClick={() => setDetail(tm.id)} className="cursor-pointer transition hover:bg-gold-400/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={tm.name} hue={tm.hue} size={30} />
                      <span className="font-semibold text-ink">{tm.name}</span>
                    </div>
                  </td>
                  <td className="max-w-44 truncate px-4 py-3 text-ink-2">{tm.school}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><CodeChip code={tm.code} /><span className="hidden text-ink-2 sm:inline">{tm.country}</span></div></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={tm.stage} max={5} className="w-20" />
                      <span className="text-xs font-semibold text-ink-2">{tm.stage}/5</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-ink">{fmtNum(tm.points)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pageRows.length === 0 && <div className="p-6"><EmptyState title={t("c.emptyTitle")} body={t("c.emptyBody")} /></div>}
        {/* pagination */}
        <div className="flex items-center justify-between border-t border-hairline px-4 py-3 text-sm">
          <span className="text-xs font-semibold text-ink-2/70">{fmtNum(filtered.length)} {t("c.teams")} · {safePage + 1}/{pageCount}</span>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} aria-label={t("c.prev")}><ChevronLeft size={15} /></Button>
            <Button variant="outline" size="sm" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)} aria-label={t("c.next")}><ChevronRight size={15} /></Button>
          </div>
        </div>
      </Card>

      {/* team detail modal */}
      <Modal open={!!detailTeam} onClose={() => setDetail(null)} title={t("p.detail")} wide>
        {detailTeam && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={detailTeam.name} hue={detailTeam.hue} size={52} />
              <div>
                <div className="font-display text-xl text-ink">{detailTeam.name}</div>
                <div className="text-xs text-ink-2/70">{detailTeam.school} · {detailTeam.country}</div>
              </div>
              <button className="ml-auto rounded-full p-1.5 hover:bg-ink/5" onClick={() => setDetail(null)} aria-label={t("c.close")}><X size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-xl bg-paper p-3">
                <div className="font-display text-xl gold-text">{fmtNum(detailTeam.points)}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-2/60">{t("c.points")}</div>
              </div>
              <div className="rounded-xl bg-paper p-3">
                <div className="font-display text-xl text-ink">{detailTeam.stage}/5</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-2/60">{t("p.stageOf")}</div>
              </div>
              <div className="rounded-xl bg-paper p-3">
                <div className="font-display text-xl text-ink">{7}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-2/60">{t("c.students")}</div>
              </div>
            </div>
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-2/70">{t("p.colStage")}</div>
              <div className="space-y-2">
                {state.milestones.map((m) => {
                  const done = m.id < detailTeam.stage;
                  return (
                    <div key={m.id} className="flex items-center gap-3">
                      <span className={cx("h-2.5 w-2.5 rounded-full", done ? "bg-gold-500" : m.id === detailTeam.stage ? "bg-pine-600" : "bg-ink/15")} />
                      <span className="flex-1 text-sm text-ink">{m.name[state.lang]}</span>
                      <span className="text-xs font-semibold text-ink-2/60">{done ? t("c.done") : "—"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
