"use client";

/* Settings — profile, language, notification preferences, privacy
   (export/delete my data), safeguarding and session controls.
   Shared-device friendly: "switch account" is one tap away. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Globe2, LogOut, Mail, RefreshCcw, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { LANGS } from "@/lib/i18n";
import { COUNTRIES } from "@/lib/mock";
import { Avatar, Button, Card, cx, Field, Input, Modal, SectionHead, Select, Switch } from "@/components/ui";
import { downloadText } from "@/lib/utils";

export default function SettingsPage() {
  const { state, user, t, dispatch, setLang, logout, toast, resetDemo, lang } = useApp();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? "");
  const [school, setSchool] = useState(user?.school ?? "");
  const [country, setCountry] = useState(user?.country ?? "Kenya");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [safeOpen, setSafeOpen] = useState(false);

  if (!user) return null;

  const saveProfile = () => {
    dispatch({ type: "UPDATE_PROFILE", patch: { name: name.trim() || user.name, school, country } });
    toast(t("s.saved"), "success");
  };

  const exportData = () => {
    const mine = {
      exportedAt: new Date().toISOString(),
      user,
      teams: state.teams.filter((tm) => tm.id.startsWith("team-")),
      notifications: state.notifications,
      preferences: state.prefs,
    };
    downloadText("my-sec-data.json", JSON.stringify(mine, null, 2), "application/json");
    toast(t("s.exported"), "success");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* profile */}
      <Card className="p-5">
        <SectionHead kicker={t("c.profile")} title={t("s.profile")} />
        <div className="mb-4 flex items-center gap-4">
          <Avatar name={name || user.name} hue={user.hue} size={56} className="ring-gold-400/60" />
          <div className="text-xs leading-relaxed text-ink-2/70">
            <div className="font-semibold text-ink">{user.email}</div>
            {t("role." + user.role)} · {user.country}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("s.name")}><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label={t("s.school")}><Input value={school} onChange={(e) => setSchool(e.target.value)} placeholder={t("s.school")} /></Field>
          <Field label={t("c.country")}>
            <Select value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label={t("s.email")}><Input value={user.email} disabled className="opacity-60" /></Field>
        </div>
        <Button variant="gold" className="mt-4" onClick={saveProfile}>{t("c.save")}</Button>
      </Card>

      {/* language */}
      <Card className="p-5">
        <SectionHead kicker={t("c.language")} title={t("s.language")} />
        <p className="-mt-2 mb-4 flex items-center gap-2 text-sm text-ink-2"><Globe2 size={15} className="text-pine-700" /> {t("s.langHint")}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {LANGS.map((l) => (
            <button key={l.id} onClick={() => setLang(l.id)} aria-pressed={lang === l.id}
              className={cx("flex items-center justify-between rounded-2xl border p-4 text-left transition",
                lang === l.id ? "border-gold-500 bg-gold-400/15 shadow-luxe" : "border-hairline bg-paper hover:border-gold-500/40")}>
              <span>
                <span className="block font-display text-lg text-ink">{l.label}</span>
                <span className="text-xs text-ink-2/70">{l.id === "en" ? "Corporate English, friendly tone" : "Español neutro, tono cercano"}</span>
              </span>
              <span className={cx("flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-black",
                lang === l.id ? "border-gold-500 bg-gold-400 text-ink" : "border-hairline text-ink/30")}>
                {lang === l.id ? "✓" : l.short}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-paper p-3.5 text-sm italic text-ink-2">
          “{t("web.h1a")} {t("web.h1b")} {t("web.h1c")}”
        </div>
      </Card>

      {/* notifications */}
      <Card className="p-5">
        <SectionHead kicker={t("c.notifications")} title={t("s.notifs")} />
        <div className="divide-y divide-hairline/60">
          {([
            { k: "nEmail" as const, title: t("s.nEmail"), desc: t("s.nEmailDesc") },
            { k: "nAnnounce" as const, title: t("s.nAnnounce"), desc: t("s.nAnnounceDesc") },
            { k: "nFeedback" as const, title: t("s.nFeedback"), desc: t("s.nFeedbackDesc") },
          ]).map((p) => (
            <div key={p.k} className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-ink"><Mail size={14} className="text-pine-700" /> {p.title}</div>
                <div className="mt-0.5 text-xs text-ink-2/75">{p.desc}</div>
              </div>
              <Switch checked={state.prefs[p.k]} onChange={(v) => dispatch({ type: "SET_PREF", key: p.k, value: v })} label={p.title} />
            </div>
          ))}
        </div>
      </Card>

      {/* privacy */}
      <Card className="p-5">
        <SectionHead kicker="GDPR" title={t("s.privacy")} />
        <p className="-mt-1 mb-4 rounded-xl border border-clay-500/30 bg-clay-500/10 p-3.5 text-xs leading-relaxed text-ink">{t("s.minor")}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={exportData}>
            <Download size={15} /> {t("s.export")}
          </Button>
          <Button variant="outline" className="flex-1 !border-clay-500/40 !text-clay-600 hover:!bg-clay-500/10" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={15} /> {t("s.delete")}
          </Button>
        </div>
        <p className="mt-2 text-xs text-ink-2/60">{t("s.exportHint")} · {t("s.deleteHint")}</p>
      </Card>

      {/* safeguarding */}
      <Card className="p-5">
        <SectionHead kicker="TAMTF" title={t("s.safe")} />
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pine-950 text-gold-300"><ShieldCheck size={19} /></span>
          <p className="text-sm leading-relaxed text-ink-2">{t("s.safeBody")}</p>
        </div>
        <Button variant="outline" className="mt-4" onClick={() => setSafeOpen(true)}>
          <ShieldAlert size={15} className="text-clay-600" /> {t("s.safeReport")}
        </Button>
      </Card>

      {/* session */}
      <Card className="p-5">
        <SectionHead kicker={t("s.session")} title={t("s.session")} />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={() => router.push("/login")}>
            <RefreshCcw size={15} /> {t("c.switch")}
          </Button>
          <Button variant="danger" className="flex-1" onClick={() => { logout(); toast(t("t.logout"), "info"); router.push("/login"); }}>
            <LogOut size={15} /> {t("c.logout")}
          </Button>
        </div>
        <p className="mt-4 text-center text-[11px] font-semibold uppercase tracking-widest text-ink-2/50">{t("s.version")}</p>
      </Card>

      {/* confirm delete */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title={t("s.delete")}>
        <p className="text-sm text-ink-2">{t("s.deleteConfirm")}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(false)}>{t("c.cancel")}</Button>
          <Button variant="danger" className="flex-1" onClick={() => { setConfirmDelete(false); resetDemo(); toast(t("s.deleted"), "info"); }}>
            {t("s.delete")}
          </Button>
        </div>
      </Modal>

      {/* safeguarding modal */}
      <Modal open={safeOpen} onClose={() => setSafeOpen(false)} title={t("s.safeReport")}>
        <p className="text-sm leading-relaxed text-ink-2">{t("s.reportBody")}</p>
        <Button variant="gold" className="mt-5 w-full" onClick={() => { setSafeOpen(false); toast(t("t.saved"), "success"); }}>
          {t("c.close")}
        </Button>
      </Modal>
    </div>
  );
}
