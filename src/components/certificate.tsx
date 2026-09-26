"use client";

/* Award certificate — an ornate, printable certificate modal.
   The preview is hand-composed with CSS (gold double frame + wax seal); the
   download is a self-contained .html file that prints beautifully on paper.
   Used from the Team page badges card and the Journey reviewed panel. */

import { Award, Download, Medal } from "lucide-react";
import { useApp } from "@/lib/store";
import type { MilestoneCfg, Team } from "@/lib/types";
import { Button, Modal } from "@/components/ui";
import { downloadText, fmtDate } from "@/lib/utils";

function certificateHtml(team: Team, milestone: MilestoneCfg, score: number, lang: string, t: (k: string) => string) {
  // a fully self-contained A4 landscape certificate (no external assets)
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${t("cert.title")}</title>
<style>
@page { size: A4 landscape; margin: 0; }
body { margin:0; display:flex; min-height:100vh; align-items:center; justify-content:center; background:#f5efe3; font-family:Georgia, serif; }
.card { width:1080px; min-height:720px; background:#fbf7ee; border:14px solid #0d3327; outline:3px solid #c9a44e; outline-offset:-10px; padding:70px 90px; box-sizing:border-box; text-align:center; position:relative; }
h1 { font-size:52px; letter-spacing:2px; color:#0e2b21; margin:0 0 6px; }
.eyebrow { letter-spacing:6px; text-transform:uppercase; font-size:14px; color:#a9832f; }
.name { font-size:44px; font-style:italic; color:#0e2b21; margin:26px 0 4px; }
.line { width:320px; height:1px; background:#c9a44e; margin:14px auto; }
.for { font-size:20px; color:#33463d; max-width:640px; margin:0 auto; line-height:1.55; }
.milestone { font-size:30px; color:#0e2b21; font-weight:bold; }
.score { display:inline-block; margin-top:22px; padding:10px 26px; border:1.5px solid #c9a44e; border-radius:999px; color:#a9832f; font-size:20px; }
.seal { position:absolute; right:80px; bottom:70px; width:110px; height:110px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #e9ce8a, #c9a44e 55%, #a9832f); color:#0d3327; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; letter-spacing:1px; box-shadow:0 6px 18px rgba(0,0,0,.25); }
.sig { position:absolute; left:80px; bottom:80px; text-align:center; font-size:14px; color:#33463d; }
.sig b { display:block; border-top:1px solid #33463d; padding-top:6px; font-style:italic; }
.meta { position:absolute; top:26px; left:0; right:0; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#a9832f; }
</style></head><body><div class="card">
<div class="meta">School Enterprise Challenge · Teach A Man To Fish · 2025/26</div>
<div class="eyebrow" style="margin-top:26px">SEC Global Awards</div>
<h1>${t("cert.title")}</h1>
<div>${t("cert.presented")}</div>
<div class="name">${team.name}</div>
<div style="font-size:15px;color:#33463d">${team.school} · ${team.country}</div>
<div class="line"></div>
<div class="for">${t("cert.for")}</div>
<div class="milestone">${milestone.name.en} / ${milestone.name.es}</div>
<div class="score">${t("cert.score")} ${score}/100 · ${fmtDate(new Date().toISOString())}</div>
<div class="sig"><b>Tamara H.</b>${t("cert.holder")}</div>
<div class="seal">SEC<br/>GOLD<br/>SEAL</div>
</div><script>window.print&&0</script></body></html>`;
}

export function CertificateModal({
  open, onClose, team, milestone, score,
}: {
  open: boolean; onClose: () => void; team: Team; milestone: MilestoneCfg; score: number;
}) {
  const { t, lang, toast } = useApp();
  const download = () => {
    downloadText(`SEC-Certificate-${team.name.replace(/\s+/g, "-")}-${milestone.name.en.replace(/\s+/g, "-")}.html`,
      certificateHtml(team, milestone, score, lang, t), "text/html");
    toast(t("cert.downloaded"), "success");
  };
  return (
    <Modal open={open} onClose={onClose} title={t("cert.title")} wide>
      {/* on-screen preview — a miniaturised, luxurious version of the print file */}
      <div className="relative overflow-hidden rounded-2xl border-[10px] border-pine-900 bg-cream px-6 py-8 text-center shadow-luxe-lg" style={{ outline: "2px solid #c9a44e", outlineOffset: "-8px" }}>
        <div className="text-[9px] font-bold uppercase tracking-[0.32em] text-gold-600">School Enterprise Challenge · 2025/26</div>
        <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-700">SEC Global Awards</div>
        <h2 className="mt-1 font-display text-3xl font-medium text-ink">{t("cert.title")}</h2>
        <div className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-ink-2/70">{t("cert.presented")}</div>
        <div className="font-display text-2xl italic text-ink">{team.name}</div>
        <div className="text-xs text-ink-2/70">{team.school} · {team.country}</div>
        <div className="rule-gold mx-auto my-4 w-48" />
        <p className="mx-auto max-w-md text-sm text-ink-2">{t("cert.for")}</p>
        <div className="mt-1 font-display text-xl font-semibold text-ink">{milestone.name[lang]}</div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold-500 px-4 py-1.5 text-sm font-bold text-gold-700">
          <Medal size={14} /> {t("cert.score")} {score}/100 · {fmtDate(new Date().toISOString())}
        </div>
        <div className="absolute bottom-4 left-5 text-left text-[10px] text-ink-2/70">
          <span className="block border-t border-ink/30 pt-1 font-display italic">Tamara H.</span>
          {t("cert.holder")}
        </div>
        <div className="absolute bottom-4 right-5 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-600 text-[8px] font-black uppercase tracking-widest text-pine-950 shadow-lg">
          SEC<br />Gold<br />Seal
        </div>
      </div>
      <Button variant="gold" className="mt-4 w-full" onClick={download}>
        <Download size={15} /> {t("cert.download")}
      </Button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-2/60">
        <Award size={12} /> {t("cert.ready")} — A4 landscape, print-friendly
      </p>
    </Modal>
  );
}
