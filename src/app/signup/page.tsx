"use client";

/* Teacher sign-up + onboarding wizard (Phase 1 · 5.1)
   4 steps: details → confirm school → create first team → invite students.
   - Duplicate school detection against existing records (5.8 one record per school)
   - Welcome message simulated via email or WhatsApp depending on contact choice
   - Finishing logs the teacher IN with their brand-new team on the dashboard */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, Languages, Mail,
  MessageCircle, School, UserPlus, Users,
} from "lucide-react";
import { useApp } from "@/lib/store";
import type { Team } from "@/lib/types";
import { COUNTRIES, EXISTING_SCHOOLS } from "@/lib/mock";
import { LANGS } from "@/lib/i18n";
import { LangSwitch, Logo } from "@/components/shell";
import { Button, cx, Field, Input, Modal, Select, Textarea } from "@/components/ui";
import { uid } from "@/lib/utils";

const STEP_ICONS = [Users, School, Building2, UserPlus];

export default function SignupPage() {
  const { t, setLang, login, dispatch, toast } = useApp();
  const router = useRouter();

  const [step, setStep] = useState(0);
  // step 1
  const [name, setName] = useState("");
  const [contactTab, setContactTab] = useState<"email" | "phone">("email");
  const [contact, setContact] = useState("");
  const [school, setSchool] = useState("");
  const [country, setCountry] = useState("Kenya");
  const [langPref, setLangPref] = useState<"en" | "es">("en");
  const [pw, setPw] = useState("");
  const [dupAck, setDupAck] = useState<null | "yes" | "no">(null);
  // step 2
  const [schoolType, setSchoolType] = useState("Secondary");
  const [students, setStudents] = useState("100–500");
  // step 3
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState("5");
  // step 4
  const [invites, setInvites] = useState("");
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  // fuzzy duplicate detection: exact match or one contains the other (≥6 chars)
  const duplicate = useMemo(() => {
    const q = school.trim().toLowerCase();
    if (q.length < 6 || dupAck) return null;
    return EXISTING_SCHOOLS.find((s) => {
      const x = s.toLowerCase();
      return x === q || x.includes(q) || q.includes(x);
    }) ?? null;
  }, [school, dupAck]);

  const stepValid = [
    name.trim().length > 1 && contact.trim().length > 4 && school.trim().length > 3 && (duplicate ? dupAck !== null : true),
    true,
    teamName.trim().length > 2,
    true,
  ][step];

  const finish = () => {
    const countryRow = COUNTRIES.find((c) => c.name === country);
    const user = login("teacher", name.trim(), country, contactTab === "email" ? contact.trim() : `${contact.trim()}@wa.sec`);
    const members = invites
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 12)
      .map((n) => ({ id: uid("tm"), name: n, role: "Team Member", consent: false }));
    const team: Team = {
      id: uid("team"), name: teamName.trim(),
      school: duplicate && dupAck === "yes" ? duplicate : school.trim(),
      country, code: countryRow?.code ?? "—",
      region: countryRow?.region ?? "Africa",
      partnerId: "po-01",
      teacherName: user.name,
      stage: 0, points: 0,
      members,
      progress: { 0: { status: "open" }, 1: { status: "open" }, 2: { status: "open" }, 3: { status: "locked" }, 4: { status: "locked" } },
      hue: 140 + Math.floor(Math.random() * 80),
    };
    dispatch({ type: "CREATE_TEAM", team, notifTitle: t("sg.welcomeNotifTitle"), notifBody: t("sg.welcomeNotifBody") });
    // simulated welcome message lands as a support thread reply too
    dispatch({
      type: "RECEIVE_MESSAGE", threadId: "th-3", author: "SEC Support",
      body: `${t("sg.welcomeNotifTitle")} ${t("sg.welcomeNotifBody")}`, at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    setWelcomeOpen(true);
    toast(t("sg.welcomeTitle"), "success");
  };

  return (
    <div className="min-h-dvh bg-paper">
      <header className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
        <Link href="/"><Logo /></Link>
        <LangSwitch />
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-4">
        {/* step indicator */}
        <div className="mb-8 flex items-center gap-1.5">
          {[0, 1, 2, 3].map((i) => {
            const Icon = STEP_ICONS[i];
            const active = i === step, done = i < step;
            return (
              <div key={i} className="flex flex-1 items-center gap-1.5">
                <span className={cx(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition",
                  done ? "border-gold-400 bg-gold-400 text-ink" : active ? "border-gold-500 bg-cream text-gold-700" : "border-hairline text-ink/25"
                )}>
                  {done ? <Check size={15} strokeWidth={3} /> : <Icon size={15} />}
                </span>
                {i < 3 && <span className={cx("h-0.5 flex-1 rounded-full", done ? "bg-gold-400" : "bg-ink/10")} />}
              </div>
            );
          })}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-hairline bg-cream p-6 shadow-luxe sm:p-8">

          <h1 className="font-display text-2xl font-light text-ink sm:text-3xl">
            {[t("sg.step1"), t("sg.step2"), t("sg.step3"), t("sg.step4")][step]}
          </h1>
          {step === 0 && <p className="mt-1 text-sm text-ink-2">{t("sg.sub")}</p>}

          {/* ---- step 1: details ---- */}
          {step === 0 && (
            <div className="mt-6 space-y-4">
              <Field label={t("s.name")}><Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Amara K." /></Field>
              <Field label={contactTab === "email" ? t("l.email") : t("sg.phone")}>
                <div className="mb-2 grid grid-cols-2 gap-1.5">
                  {(["email", "phone"] as const).map((cTab) => (
                    <button key={cTab} type="button" onClick={() => setContactTab(cTab)} aria-pressed={contactTab === cTab}
                      className={cx("flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition",
                        contactTab === cTab ? "border-gold-500 bg-gold-400/15 text-gold-700" : "border-hairline text-ink-2 hover:border-gold-500/40")}>
                      {cTab === "email" ? <Mail size={13} /> : <MessageCircle size={13} />} {cTab === "email" ? t("sg.contactEmail") : t("sg.contactPhone")}
                    </button>
                  ))}
                </div>
                <Input type={contactTab === "email" ? "email" : "tel"} value={contact} onChange={(e) => setContact(e.target.value)}
                  placeholder={contactTab === "email" ? "you@school.edu" : "+254 700 000 000"} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("c.country")}>
                  <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                    {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
                  </Select>
                </Field>
                <Field label={t("sg.langPref")}>
                  <Select value={langPref} onChange={(e) => { const l = e.target.value as "en" | "es"; setLangPref(l); setLang(l); }}>
                    {LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </Select>
                </Field>
              </div>
              <Field label={t("sg.school")}>
                <Input value={school} onChange={(e) => { setSchool(e.target.value); setDupAck(null); }} placeholder="Sunrise Secondary School" />
              </Field>
              {duplicate && (
                <div className="rounded-xl border border-clay-500/40 bg-clay-500/10 p-4">
                  <div className="text-sm font-bold text-clay-600">{t("sg.dupTitle")}: “{duplicate}”</div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-2">{t("sg.dupBody")}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Button variant="outline" size="sm" onClick={() => { setDupAck("yes"); setSchool(duplicate); }}>{t("sg.dupYes")}</Button>
                    <Button variant="outline" size="sm" onClick={() => setDupAck("no")}>{t("sg.dupNo")}</Button>
                  </div>
                </div>
              )}
              <Field label={t("sg.pw")}><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></Field>
            </div>
          )}

          {/* ---- step 2: confirm school ---- */}
          {step === 1 && (
            <div className="mt-6 space-y-4">
              <Field label={t("sg.school")}><Input value={school} onChange={(e) => setSchool(e.target.value)} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("sg.schoolType")}>
                  <Select value={schoolType} onChange={(e) => setSchoolType(e.target.value)}>
                    {(["Secondary", "Primary", "Vocational", "Mixed"] as const).map((st) => (
                      <option key={st} value={st}>{t("sg.type" + st as "sg.typeSecondary")}</option>
                    ))}
                  </Select>
                </Field>
                <Field label={t("sg.studentsCount")}>
                  <Select value={students} onChange={(e) => setStudents(e.target.value)}>
                    {["< 100", "100–500", "500–1,500", "1,500+"].map((v) => <option key={v} value={v}>{v}</option>)}
                  </Select>
                </Field>
              </div>
              <div className="rounded-2xl border border-hairline bg-paper p-4 text-sm">
                <div className="font-semibold text-ink">{school}</div>
                <div className="mt-1 text-ink-2/80">{schoolType} · {country} · {students} {t("c.students")}</div>
              </div>
            </div>
          )}

          {/* ---- step 3: first team ---- */}
          {step === 2 && (
            <div className="mt-6 space-y-4">
              <Field label={t("sg.teamName")}><Input autoFocus value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Sunrise Juice Co." /></Field>
              <Field label={t("sg.teamSize")}>
                <Select value={teamSize} onChange={(e) => setTeamSize(e.target.value)}>
                  {["3", "4", "5", "6", "7+"].map((v) => <option key={v} value={v}>{v}</option>)}
                </Select>
              </Field>
              <div className="flex items-center gap-3 rounded-xl bg-pine-50 p-4 text-sm text-ink-2">
                <Languages size={16} className="shrink-0 text-pine-700" />
                {t("web.jSub")}
              </div>
            </div>
          )}

          {/* ---- step 4: invite students ---- */}
          {step === 3 && (
            <div className="mt-6 space-y-4">
              <Field label={t("sg.inviteNames")} hint={t("sg.inviteHint")}>
                <Textarea value={invites} onChange={(e) => setInvites(e.target.value)} placeholder="Amina O., Baraka M., Ciku N." />
              </Field>
              <div className="flex items-center gap-3 rounded-xl border border-clay-500/30 bg-clay-500/10 p-4 text-xs leading-relaxed text-ink">
                <UserPlus size={15} className="shrink-0 text-clay-600" /> {t("s.minor")}
              </div>
            </div>
          )}

          {/* nav buttons */}
          <div className="mt-6 flex gap-2">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft size={15} /> {t("c.back")}</Button>
            ) : (
              <Link href="/login" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-ink-2 hover:text-ink">
                <ArrowLeft size={15} /> {t("sg.haveAccount")} {t("l.createTitle")}
              </Link>
            )}
            <div className="flex-1" />
            {step < 3 && (
              <Button variant="gold" disabled={!stepValid} onClick={() => setStep(step + 1)}>
                {t("sg.next")} <ArrowRight size={15} />
              </Button>
            )}
            {step === 3 && (
              <>
                <Button variant="outline" onClick={finish}>{t("sg.skip")}</Button>
                <Button variant="gold" onClick={finish}><CheckCircle2 size={15} /> {t("sg.finish")}</Button>
              </>
            )}
          </div>
        </motion.div>
      </main>

      {/* welcome modal */}
      <Modal open={welcomeOpen} onClose={() => { setWelcomeOpen(false); router.push("/app"); }} title={t("sg.welcomeTitle")}>
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/20 text-gold-700">
            {contactTab === "email" ? <Mail size={28} /> : <MessageCircle size={28} />}
          </span>
          <p className="mt-4 text-sm leading-relaxed text-ink-2">
            {contactTab === "email" ? t("sg.welcomeSentEmail") : t("sg.welcomeSentPhone")}
          </p>
          <p className="mt-2 text-xs text-ink-2/60">{teamName} · {school} · {country}</p>
          <Button variant="gold" className="mt-6 w-full" onClick={() => router.push("/app")}>
            {t("sg.finish")} <ArrowRight size={15} />
          </Button>
        </div>
      </Modal>
    </div>
  );
}
