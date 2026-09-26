"use client";

/* Resource library — guides, templates, videos and finance tools in
   English and Spanish. Previews and downloads are generated client-side,
   so they work even on a 3G connection. */

import { useMemo, useState } from "react";
import type { ElementType } from "react";
import { BookOpen, CirclePlay, Coins, Download, Eye, FileText, Megaphone, Search, Star } from "lucide-react";
import { useApp } from "@/lib/store";
import type { Resource } from "@/lib/types";
import { Button, Card, cx, EmptyState, Modal } from "@/components/ui";
import { downloadText } from "@/lib/utils";

type Cat = "all" | "saved" | Resource["cat"];

const CAT_META: Record<Cat, { icon: ElementType | null; key: string }> = {
  all: { icon: null, key: "c.all" },
  saved: { icon: Star, key: "fav.mine" },
  Guides: { icon: BookOpen, key: "r.catGuides" },
  Templates: { icon: FileText, key: "r.catTemplates" },
  Finance: { icon: Coins, key: "r.catFinance" },
  Marketing: { icon: Megaphone, key: "r.catMarketing" },
  Videos: { icon: CirclePlay, key: "r.catVideos" },
};

export default function ResourcesPage() {
  const { state, t, toast, dispatch } = useApp();
  const [cat, setCat] = useState<Cat>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Resource | null>(null);

  const list = useMemo(() => state.resources.filter((r) => {
    if (cat === "saved" && !state.favorites.includes(r.id)) return false;
    if (cat !== "all" && cat !== "saved" && r.cat !== (cat as Resource["cat"])) return false;
    if (q && !`${r.title} ${r.desc}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [state.resources, cat, q, state.favorites]);

  const toggleFav = (r: Resource) => {
    const adding = !state.favorites.includes(r.id);
    dispatch({ type: "TOGGLE_FAVORITE", id: r.id });
    toast(adding ? t("fav.added") : t("fav.removed"), adding ? "success" : "info", r.title);
  };

  const download = (r: Resource) => {
    downloadText(`SEC-${r.title.replace(/[^a-z0-9]+/gi, "-")}.txt`, r.body);
    toast(t("c.download"), "success", r.title);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-ink-2">{t("r.subtitle")}</p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("r.searchPh")}
            className="w-full rounded-full border border-hairline bg-cream py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold-500" />
        </div>
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {(Object.keys(CAT_META) as Cat[]).map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
              className={cx("whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-bold transition",
                cat === c ? "border-gold-500 bg-gold-400/15 text-gold-700" : "border-hairline bg-cream text-ink-2 hover:border-gold-500/40")}>
              {t(CAT_META[c].key)}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 && <EmptyState title={t("c.emptyTitle")} body={t("r.empty")} icon={<BookOpen size={28} />} />}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => {
          const Meta = CAT_META[r.cat];
          const Icon = Meta.icon ?? BookOpen;
          return (
            <Card key={r.id} className="group flex flex-col p-5 transition hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-luxe-lg">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pine-950 text-gold-300">
                  <Icon size={19} />
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-pine-100 px-2 py-1 text-[10px] font-bold tracking-wider text-pine-700">{r.lang}</span>
                  <span className="rounded-full bg-ink/5 px-2 py-1 text-[10px] font-bold tracking-wider text-ink-2">{r.size}</span>
                  <button onClick={() => toggleFav(r)} aria-label={t("fav.save")} aria-pressed={state.favorites.includes(r.id)}
                    className={cx("rounded-full p-1.5 transition",
                      state.favorites.includes(r.id) ? "text-gold-600" : "text-ink/25 hover:bg-gold-400/15 hover:text-gold-600")}>
                    <Star size={16} fill={state.favorites.includes(r.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
              <h3 className="mt-4 font-display text-lg leading-snug text-ink">{r.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-2/85">{r.desc}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setOpen(r)}>
                  <Eye size={13} /> {t("c.preview")}
                </Button>
                <Button variant="gold" size="sm" className="flex-1" onClick={() => download(r)}>
                  <Download size={13} /> {t("c.download")}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* preview modal */}
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.title ?? ""} wide>
        {open && (
          <div className="space-y-4">
            <div className="flex gap-1.5">
              <span className="rounded-full bg-pine-100 px-2.5 py-1 text-[10px] font-bold tracking-wider text-pine-700">{open.lang}</span>
              <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[10px] font-bold tracking-wider text-ink-2">{t(META_KEY(open.cat))}</span>
              <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[10px] font-bold tracking-wider text-ink-2">{open.size}</span>
            </div>
            <pre className="whitespace-pre-wrap rounded-2xl bg-pine-950 p-5 font-mono text-xs leading-relaxed text-cream/85">{open.body}</pre>
            <Button variant="gold" className="w-full" onClick={() => { download(open); setOpen(null); }}>
              <Download size={15} /> {t("c.download")}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function META_KEY(cat: Resource["cat"]) {
  return CAT_META[cat].key;
}
