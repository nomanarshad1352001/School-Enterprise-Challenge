"use client";

/* Login / register — demo edition.
   One-tap personas let evaluators jump into any role instantly; the form
   accepts any credentials (data stays on the device — see docs/). */

import { useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Award, Globe2, Landmark, Mail, ShieldCheck, Sprout, User2, Users } from "lucide-react";
import { PERSONAS, useApp } from "@/lib/store";
import type { Role } from "@/lib/types";
import { COUNTRIES } from "@/lib/mock";
import { LangSwitch, Logo } from "@/components/shell";
import { Avatar, Button, cx, Field, Input, Select, ToastHost } from "@/components/ui";

const ROLE_ICONS: Record<Role, ElementType> = {
  teacher: Users, student: Sprout, reviewer: Award, partner: Landmark, admin: ShieldCheck,
};

export default function LoginPage() {
  const { t, login, toast } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Kenya");
  const [role, setRole] = useState<Role>("teacher");

  const enter = (r: Role, n?: string, c?: string, e?: string) => {
    const user = login(r, n, c, e);
    toast(`${t("l.signedIn")}, ${user.name.split(" ")[0]}`, "success");
    router.push("/app");
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* ---- brand panel ---- */}
      <div className="grain relative hidden flex-col justify-between overflow-hidden bg-pine-950 p-10 text-cream lg:flex">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.pexels.com/photos/36467878/pexels-photo-36467878.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1000"
          alt="" aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pine-950/70 via-pine-950/40 to-pine-950" />
        <Link href="/" className="relative"><Logo dark /></Link>
        <div className="relative">
          <p className="font-display text-3xl font-light leading-snug xl:text-4xl">
            “{t("web.q3")}”
          </p>
          <div className="mt-6 text-sm font-semibold text-gold-300">{t("web.n3")}</div>
          <div className="text-xs uppercase tracking-widest text-cream/50">{t("web.r3")}</div>
          <div className="mt-10 flex items-center gap-8 border-t border-cream/10 pt-8">
            {[
              { v: "60,000+", k: "c.students" },
              { v: "61", k: "c.countries" },
              { v: "12", k: "c.partners" },
            ].map((s) => (
              <div key={s.k}>
                <div className="font-display text-2xl text-gold-300">{s.v}</div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-cream/50">{t(s.k)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- form panel ---- */}
      <div className="flex min-h-dvh flex-col bg-paper px-4 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-md items-center justify-between lg:hidden">
          <Link href="/"><Logo /></Link>
          <LangSwitch />
        </div>
        <div className="mx-auto hidden w-full max-w-md items-center justify-between lg:flex">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-2 transition hover:text-ink">
            <ArrowLeft size={15} /> {t("l.backHome")}
          </Link>
          <LangSwitch />
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-3xl font-light tracking-tight text-ink sm:text-4xl">{t("l.welcome")}</h1>
          <p className="mt-2 text-sm text-ink-2">{t("l.welcomeSub")}</p>

          {/* personas */}
          <div className="mt-8">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-700">{t("l.quickTitle")}</div>
            <p className="mt-1 text-xs text-ink-2/70">{t("l.quickHint")}</p>
            <div className="mt-4 grid grid-cols-1 gap-2.5">
              {PERSONAS.map((p, i) => {
                const Icon = ROLE_ICONS[p.role];
                return (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}
                    onClick={() => enter(p.role, p.name, p.country, p.email)}
                    className="group flex items-center gap-3.5 rounded-2xl border border-hairline bg-cream p-3.5 text-left shadow-luxe transition hover:-translate-y-0.5 hover:border-gold-500/60 hover:shadow-luxe-lg active:scale-[0.98]"
                  >
                    <Avatar name={p.name} hue={p.hue} size={44} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-ink">{p.name}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-ink-2">
                        <Icon size={12} className="text-gold-600" /> {t("role." + p.role)} · {p.country}
                      </span>
                    </span>
                    <ArrowRight size={16} className="shrink-0 text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-gold-600" />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* divider */}
          <div className="my-8 flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-2/60">
            <span className="h-px flex-1 bg-hairline" /> {t("l.or")} <span className="h-px flex-1 bg-hairline" />
          </div>

          {/* classic form */}
          <form
            className="space-y-4"
            onSubmit={(e) => { e.preventDefault(); enter(role, name || undefined, country, email || undefined); }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t("l.name")}>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Amara K." />
              </Field>
              <Field label={t("l.countrySel")}>
                <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                  {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
                </Select>
              </Field>
            </div>
            <Field label={t("l.email")}>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2/40" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" className="pl-10" />
              </div>
            </Field>
            <Field label={t("l.roleSel")}>
              <div className="grid grid-cols-5 gap-1.5">
                {(Object.keys(ROLE_ICONS) as Role[]).map((r) => {
                  const Icon = ROLE_ICONS[r];
                  const active = role === r;
                  return (
                    <button key={r} type="button" onClick={() => setRole(r)} aria-pressed={active}
                      className={cx(
                        "flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-[10px] font-bold transition",
                        active ? "border-gold-500 bg-gold-400/15 text-gold-700" : "border-hairline bg-cream text-ink-2 hover:border-gold-500/40"
                      )}>
                      <Icon size={16} />
                      <span className="line-clamp-1">{t("role." + r).split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </Field>
            <Button type="submit" className="w-full" size="lg">
              {t("l.signIn")} <ArrowRight size={16} />
            </Button>
          </form>

          <Link href="/signup"
            className="mt-8 flex items-center justify-between gap-2 rounded-2xl border border-dashed border-gold-500/60 bg-gold-400/10 px-4 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-400/20">
            <span>{t("sg.newHere")} <span className="text-gold-700">{t("sg.title")} →</span></span>
            <Sprout size={16} className="text-gold-600" />
          </Link>
          <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-ink-2/60">
            <Globe2 size={13} className="mt-0.5 shrink-0" /> {t("l.demoNote")}
          </p>
        </motion.div>
      </div>
      <ToastHost />
    </div>
  );
}
