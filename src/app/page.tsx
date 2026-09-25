"use client";

/* Public marketing site for the School Enterprise Challenge.
   Fully localised (EN/ES), mobile-first, motion-rich but low-weight. */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, Award, BellRing, ChevronRight, ClipboardList, Coins, Globe2,
  Languages, Lightbulb, ShieldCheck, Signal, Smartphone, Sprout, Trophy, Users,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { LangSwitch, Logo } from "@/components/shell";
import { CountUp, cx, Reveal } from "@/components/ui";
import { PARTNERS } from "@/lib/mock";

const IMG = {
  hero: "https://images.pexels.com/photos/34211744/pexels-photo-34211744.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=880",
  teacher: "https://images.pexels.com/photos/22616347/pexels-photo-22616347.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=760",
  market: "https://images.pexels.com/photos/32822099/pexels-photo-32822099.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=760",
  story1: "https://images.pexels.com/photos/25457343/pexels-photo-25457343.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=460&w=720",
  story2: "https://images.pexels.com/photos/7692471/pexels-photo-7692471.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=460&w=720",
  story3: "https://images.pexels.com/photos/39112019/pexels-photo-39112019.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=460&w=720",
};

const STEP_ICONS = [Sprout, Lightbulb, ClipboardList, Coins, Trophy];

export default function LandingPage() {
  const { t, lang } = useApp();
  const router = useRouter();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div className="relative min-h-dvh overflow-x-clip bg-paper">
      {/* ------------ top nav ------------ */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline/60 bg-paper/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="SEC"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-ink-2 lg:flex">
            <a href="#journey" className="transition hover:text-ink">{t("web.jLabel")}</a>
            <a href="#impact" className="transition hover:text-ink">{t("web.iLabel")}</a>
            <a href="#stories" className="transition hover:text-ink">{t("web.sLabel")}</a>
            <a href="#roles" className="transition hover:text-ink">{t("web.rLabel")}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LangSwitch />
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5 sm:block">
              {t("l.createTitle")}
            </Link>
            <button
              onClick={() => router.push("/signup")}
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream shadow-luxe transition hover:bg-pine-900 active:scale-95"
            >
              {t("web.ctaJoin")}
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ------------ hero ------------ */}
      <section className="grain relative overflow-hidden pt-16">
        <div aria-hidden className="pointer-events-none absolute -left-40 top-24 h-[480px] w-[480px] rounded-full bg-gold-300/30 blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute -right-32 bottom-0 h-[380px] w-[380px] rounded-full bg-pine-200/40 blur-[100px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-24 lg:pt-20">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}
              className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-400/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-700"
            >
              <Globe2 size={13} /> {t("web.heroLabel")}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.08, ease }}
              className="mt-6 font-display text-[clamp(2.6rem,8vw,5.2rem)] font-light leading-[1.02] tracking-tight text-ink text-balance"
            >
              {t("web.h1a")}{" "}
              <span className="font-medium">{t("web.h1b")}</span>{" "}
              <em className="gold-text font-medium not-italic underline decoration-gold-400/70 decoration-[3px] underline-offset-[10px]">{t("web.h1c")}</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.18, ease }}
              className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-2 sm:text-lg"
            >
              {t("web.heroSub")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.28, ease }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <button
                onClick={() => router.push("/signup")}
                className="group inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 font-semibold text-ink shadow-luxe-lg transition hover:bg-gold-300 active:scale-95"
              >
                {t("web.ctaJoin")}
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => router.push("/login")}
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-7 py-3.5 font-semibold text-ink transition hover:border-gold-500/60 hover:bg-cream active:scale-95"
              >
                {t("web.ctaDemo")} <ChevronRight size={16} />
              </button>
            </motion.div>
            {/* stats */}
            <motion.dl
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
              className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-hairline pt-8 sm:grid-cols-4"
            >
              {[
                { v: 60000, k: "web.statStudents" },
                { v: 61, k: "web.statCountries" },
                { v: 2438, k: "web.statEnterprises" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="sr-only">{t(s.k)}</dt>
                  <dd className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl"><CountUp to={s.v} /></dd>
                  <dd className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-2/80">{t(s.k)}</dd>
                </div>
              ))}
              <div>
                <dt className="sr-only">{t("web.statRevenue")}</dt>
                <dd className="font-display text-3xl font-medium tracking-tight gold-text sm:text-4xl">$<CountUp to={192} />k</dd>
                <dd className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-2/80">{t("web.statRevenue")}</dd>
              </div>
            </motion.dl>
          </div>

          {/* collage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <div aria-hidden className="absolute -inset-4 -rotate-2 rounded-[2rem] border border-gold-500/50" />
            <div className="relative overflow-hidden rounded-[1.75rem] shadow-luxe-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.hero} alt="Students in class" className="aspect-[4/5] w-full object-cover" fetchPriority="high" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-pine-950/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-cream">
                <div>
                  <div className="font-display text-lg">Lakeview Secondary</div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-cream/70">Kenya · 1,240 {t("c.students")}</div>
                </div>
                <span className="rounded-full bg-gold-400 px-3 py-1 text-xs font-bold text-ink">LIVE</span>
              </div>
            </div>
            {/* floating cards */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-6 top-8 hidden rounded-2xl border border-hairline bg-cream/90 p-3.5 shadow-luxe-lg backdrop-blur sm:block">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pine-100 text-pine-700"><Award size={16} /></span>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-ink-2/60">{t("mile.1.name")}</div>
                  <div className="text-sm font-bold text-ink">+88 {t("c.pts")}</div>
                </div>
              </div>
            </motion.div>
            <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -right-3 rounded-2xl border border-hairline bg-pine-950 p-4 text-cream shadow-luxe-lg sm:-right-6">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gold-300"><BellRing size={13} /> Judge</div>
              <div className="mt-1 max-w-44 text-xs leading-relaxed text-cream/80">“Best unit economics we saw this year.”</div>
            </motion.div>
          </motion.div>
        </div>

        {/* partner marquee */}
        <div className="relative border-y border-hairline bg-cream/60 py-4">
          <div className="mb-2 px-4 text-center text-[10px] font-bold uppercase tracking-[0.24em] text-ink-2/60">{t("web.trustLabel")}</div>
          <div className="relative overflow-hidden" aria-hidden>
            <div className="flex w-max animate-marquee gap-10 pr-10">
              {[...PARTNERS, ...PARTNERS].map((p, i) => (
                <span key={i} className="flex items-center gap-2.5 whitespace-nowrap font-display text-sm italic text-ink-2/75">
                  <span className="h-1 w-1 rounded-full bg-gold-500" /> {p.name} · {p.country}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------ journey (dark) ------------ */}
      <section id="journey" className="grain relative bg-pine-950 py-20 text-cream lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="max-w-2xl">
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-400">{t("web.jLabel")}</div>
              <h2 className="mt-3 font-display text-3xl font-light tracking-tight sm:text-5xl">{t("web.jTitle")}</h2>
              <p className="mt-4 text-pretty text-cream/70">{t("web.jSub")}</p>
            </div>
          </Reveal>
          <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-5 lg:overflow-visible">
            {STEP_ICONS.map((Icon, i) => (
              <Reveal key={i} delay={i * 90} className="snap-start">
                <div className="group relative flex h-full w-64 flex-col rounded-2xl border border-cream/12 bg-cream/[0.045] p-6 transition-colors hover:border-gold-400/50 hover:bg-cream/[0.08] lg:w-auto">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-400/40 bg-gold-400/10 text-gold-300 transition group-hover:bg-gold-400 group-hover:text-ink">
                      <Icon size={20} strokeWidth={1.8} />
                    </span>
                    <span className="font-display text-4xl font-light text-cream/15 transition group-hover:text-gold-400/40">0{i + 1}</span>
                  </div>
                  <h3 className="mt-6 font-display text-xl">{t(`mile.${i}.name`)}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-cream/60">{t("mile." + i + ".desc")}</p>
                  {i < 4 && <ChevronRight size={16} className="mt-4 hidden text-gold-400/50 lg:block" />}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------ impact ------------ */}
      <section id="impact" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-600">{t("web.iLabel")}</div>
              <h2 className="mt-3 font-display text-3xl font-light tracking-tight text-ink sm:text-5xl">{t("web.iTitle")}</h2>
              <p className="mt-4 text-ink-2">{t("web.iSub")}</p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Signal, title: t("web.f1"), body: t("web.f1d") },
              { icon: Smartphone, title: t("web.f2"), body: t("web.f2d") },
              { icon: Languages, title: t("web.f3"), body: t("web.f3d") },
              { icon: ShieldCheck, title: t("web.f4"), body: t("web.f4d") },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="h-full rounded-2xl border border-hairline bg-cream p-6 shadow-luxe transition hover:-translate-y-1 hover:shadow-luxe-lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pine-950 text-gold-300"><f.icon size={19} /></span>
                  <h3 className="mt-5 font-display text-lg text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2/90">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------ stories ------------ */}
      <section id="stories" className="border-y border-hairline bg-cream-2/60 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-600">{t("web.sLabel")}</div>
                <h2 className="mt-3 font-display text-3xl font-light tracking-tight text-ink sm:text-5xl">{t("web.sTitle")}</h2>
              </div>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { img: IMG.story1, q: t("web.q1"), n: t("web.n1"), r: t("web.r1"), code: "KE" },
              { img: IMG.story2, q: t("web.q2"), n: t("web.n2"), r: t("web.r2"), code: "IN" },
              { img: IMG.story3, q: t("web.q3"), n: t("web.n3"), r: t("web.r3"), code: "HN" },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <article className="group h-full overflow-hidden rounded-2xl border border-hairline bg-cream shadow-luxe transition hover:-translate-y-1.5 hover:shadow-luxe-lg">
                  <div className="relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.img} alt={s.r} loading="lazy" className="aspect-[3/2] w-full object-cover transition duration-700 group-hover:scale-105" />
                    <span className="absolute right-3 top-3 rounded-full bg-pine-950/80 px-2.5 py-1 text-[10px] font-bold tracking-widest text-gold-300 backdrop-blur">{s.code}</span>
                  </div>
                  <div className="p-6">
                    <p className="font-display text-[15px] italic leading-relaxed text-ink">“{s.q}”</p>
                    <div className="mt-5 border-t border-hairline pt-4">
                      <div className="text-sm font-bold text-ink">{s.n}</div>
                      <div className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-ink-2/70">{s.r}</div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------ roles bento ------------ */}
      <section id="roles" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-600">{t("web.rLabel")}</div>
              <h2 className="mt-3 font-display text-3xl font-light tracking-tight text-ink sm:text-5xl">{t("web.rTitle")}</h2>
              <p className="mt-4 text-ink-2">{t("web.rSub")}</p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {[
              { t: "web.rt1", d: "web.rd1", icon: Users, span: "lg:col-span-2", img: IMG.teacher },
              { t: "web.rt2", d: "web.rd2", icon: Sprout, span: "lg:col-span-2" },
              { t: "web.rt3", d: "web.rd3", icon: Award, span: "lg:col-span-2", img: IMG.market },
              { t: "web.rt4", d: "web.rd4", icon: Globe2, span: "lg:col-span-3" },
              { t: "web.rt5", d: "web.rd5", icon: ShieldCheck, span: "lg:col-span-3" },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 70} className={cx(c.span)}>
                <button
                  onClick={() => router.push("/login")}
                  className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-hairline bg-cream p-6 text-left shadow-luxe transition hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-luxe-lg"
                >
                  {c.img && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-[0.14] transition duration-700 group-hover:scale-105 group-hover:opacity-[0.22]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/85 to-cream/40" />
                    </>
                  )}
                  <div className="relative">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-gold-300 transition group-hover:bg-pine-800">
                      <c.icon size={18} />
                    </span>
                    <h3 className="mt-5 font-display text-xl text-ink">{t(c.t)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-2">{t(c.d)}</p>
                  </div>
                  <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-gold-700">
                    {t("web.rCta")}
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------ CTA ------------ */}
      <section className="px-4 pb-20 sm:px-6 lg:pb-28">
        <Reveal>
          <div className="grain relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-gold-600 via-gold-500 to-gold-300 px-6 py-16 text-center shadow-luxe-lg sm:px-12 lg:py-20">
            <div aria-hidden className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-cream/25 blur-3xl" />
            <div aria-hidden className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-pine-950/15 blur-3xl" />
            <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-light tracking-tight text-ink sm:text-5xl">{t("web.ctaTitle")}</h2>
            <p className="relative mt-4 font-medium text-ink/75">{t("web.ctaSub")}</p>
            <button
              onClick={() => router.push("/signup")}
              className="group relative mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 font-semibold text-cream shadow-luxe-lg transition hover:bg-pine-950 active:scale-95"
            >
              {t("web.ctaBtn")}
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </button>
            <div className="relative mt-6 text-[10px] font-bold uppercase tracking-[0.28em] text-ink/60">
              {lang === "es" ? "Inglés y español" : "English & Spanish"}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------ footer ------------ */}
      <footer className="grain relative bg-pine-950 pb-10 pt-16 text-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 pb-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Logo dark />
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/60">{t("brand.org")} — {t("web.heroLabel").toLowerCase()}</p>
              <div className="mt-6"><LangSwitch dark /></div>
            </div>
            {[
              { h: "web.fColP", links: ["web.jLabel", "web.iLabel", "web.sLabel", "r.title"] },
              { h: "web.fColO", links: ["web.fAbout", "web.fImpact", "web.fPartners", "web.fContact"] },
              { h: "web.fColL", links: ["web.fPrivacy", "web.fSafe", "web.fTerms"] },
            ].map((col) => (
              <div key={col.h}>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-400">{t(col.h)}</h4>
                <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" onClick={(e) => { e.preventDefault(); router.push("/login"); }} className="transition hover:text-cream">
                        {t(l)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-cream/10 pt-6 text-xs text-cream/45 sm:flex-row">
            <span>© 2026 {t("brand.org")}. {t("web.fRights")}</span>
            <span className="font-display italic text-gold-300/80">{t("brand.name")} · v2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
