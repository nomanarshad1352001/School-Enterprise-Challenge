"use client";

/* AppShell — the chrome around every signed-in page.
   Mobile-first: bottom tab bar on phones, sidebar on desktop.
   Same account works across roles (switch account → pick another persona). */

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award, Bell, BookOpen, ClipboardCheck, Globe, Home, Landmark, LayoutDashboard,
  LifeBuoy, LogOut, MessageSquare, RefreshCcw, Search, Settings, Sprout, Users, WifiOff,
} from "lucide-react";
import { useApp } from "@/lib/store";
import type { Role } from "@/lib/types";
import { LANGS } from "@/lib/i18n";
import { Avatar, cx, EmptyState, Modal, RolePill, Sheet, ToastHost, useOnline } from "./ui";
import { AskSec } from "./help";

/* ---------- brand ---------- */

export function Logo({ dark, compact }: { dark?: boolean; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={cx(
        "flex h-9 w-9 items-center justify-center rounded-xl shadow-luxe",
        dark ? "bg-gold-400 text-ink" : "bg-ink text-gold-300"
      )}>
        <Sprout size={18} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className={cx("block font-display text-[15px] font-semibold tracking-tight", dark ? "text-cream" : "text-ink")}>
            School Enterprise
          </span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-gold-600">Challenge</span>
        </span>
      )}
    </span>
  );
}

/* ---------- language switcher ---------- */

export function LangSwitch({ dark }: { dark?: boolean }) {
  const { lang, setLang } = useApp();
  return (
    <div className={cx("flex items-center rounded-full border p-0.5 text-xs font-bold",
      dark ? "border-cream/20 bg-cream/5" : "border-hairline bg-paper")}>
      {LANGS.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          aria-pressed={lang === l.id}
          className={cx(
            "rounded-full px-2.5 py-1 transition",
            lang === l.id
              ? "bg-gold-400 text-ink shadow"
              : dark ? "text-cream/70 hover:text-cream" : "text-ink-2 hover:text-ink"
          )}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

/* ---------- nav model ---------- */

interface NavItem { href: string; icon: React.ElementType; key: string; roles: Role[] }

const NAV: NavItem[] = [
  { href: "/app", icon: Home, key: "nav.home", roles: ["student", "teacher", "reviewer", "partner", "admin"] },
  { href: "/app/journey", icon: Sprout, key: "nav.journey", roles: ["student", "teacher"] },
  { href: "/app/team", icon: Users, key: "nav.team", roles: ["student", "teacher"] },
  { href: "/app/review", icon: ClipboardCheck, key: "nav.review", roles: ["reviewer"] },
  { href: "/app/partner", icon: Landmark, key: "nav.org", roles: ["partner"] },
  { href: "/app/admin", icon: LayoutDashboard, key: "nav.admin", roles: ["admin"] },
  { href: "/app/resources", icon: BookOpen, key: "nav.resources", roles: ["student", "teacher", "reviewer", "partner", "admin"] },
  { href: "/app/messages", icon: MessageSquare, key: "nav.messages", roles: ["student", "teacher", "reviewer", "partner", "admin"] },
  { href: "/app/settings", icon: Settings, key: "nav.settings", roles: ["student", "teacher", "reviewer", "partner", "admin"] },
];

const TITLE_MAP: [string, string][] = [
  ["/app/journey", "nav.journey"],
  ["/app/team", "nav.team"],
  ["/app/review", "nav.review"],
  ["/app/partner", "nav.org"],
  ["/app/admin", "nav.admin"],
  ["/app/resources", "nav.resources"],
  ["/app/messages", "nav.messages"],
  ["/app/settings", "nav.settings"],
];

/* ---------- notifications panel ---------- */

function NotificationsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, t, dispatch } = useApp();
  const router = useRouter();
  const icon = { award: Award, info: Bell, alert: RefreshCcw } as const;
  return (
    <Sheet open={open} onClose={onClose} title={t("c.notifications")}>
      <div className="flex justify-end px-5 pt-3">
        <button onClick={() => dispatch({ type: "MARK_ALL_READ" })} className="text-xs font-semibold text-pine-700 hover:underline">
          {t("c.markAllRead")}
        </button>
      </div>
      <div className="space-y-2 px-4 pb-6 pt-2">
        {state.notifications.length === 0 && <EmptyState title={t("c.emptyTitle")} body={t("c.emptyBody")} />}
        {state.notifications.map((n) => {
          const Icon = icon[n.kind] ?? Bell;
          return (
            <button
              key={n.id}
              onClick={() => {
                dispatch({ type: "MARK_ALL_READ" }); onClose();
                if (n.kind === "award" || n.kind === "alert") router.push(state.user?.role === "reviewer" ? "/app/review" : "/app/journey");
              }}
              className={cx(
                "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition hover:border-gold-500/50",
                n.read ? "border-hairline bg-cream" : "border-gold-500/40 bg-gold-400/10"
              )}
            >
              <span className={cx("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                n.kind === "award" ? "bg-gold-400/25 text-gold-700" : n.kind === "alert" ? "bg-clay-500/15 text-clay-600" : "bg-pine-100 text-pine-700")}>
                <Icon size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">{n.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-2/80">{n.body}</span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-ink-2/50">
                  {n.at === "now" ? t("c.justNow") : n.at}
                </span>
              </span>
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 animate-pulse-dot rounded-full bg-gold-500" />}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

/* ---------- global quick-find ---------- */

function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, t, user } = useApp();
  const router = useRouter();
  const [q, setQ] = useState("");
  const items = useMemo(() => {
    const pages = NAV.filter((n) => !user || n.roles.includes(user.role))
      .map((n) => ({ title: t(n.key), href: n.href, tag: "Page" }));
    const resources = state.resources.map((r) => ({ title: r.title, href: "/app/resources", tag: r.cat }));
    return [...pages, ...resources].filter((i) => i.title.toLowerCase().includes(q.toLowerCase()));
  }, [q, state.resources, t, user]);
  const go = (href: string) => { onClose(); setQ(""); router.push(href); };
  return (
    <Modal open={open} onClose={onClose} title={t("c.search")} wide>
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2/50" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("c.searchPh")}
          className="w-full rounded-xl border border-hairline bg-paper py-3 pl-10 pr-4 text-sm outline-none focus:border-gold-500"
        />
      </div>
      <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
        {items.length === 0 && <EmptyState title={t("c.emptyTitle")} />}
        {items.slice(0, 12).map((i, idx) => (
          <button key={idx} onClick={() => go(i.href)}
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-ink hover:bg-paper">
            {i.title}
            <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink-2">{i.tag}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

/* ---------- shell ---------- */

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, user, t, logout, toast } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const online = useOnline();
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const unread = state.notifications.filter((n) => !n.read).length;
  const navItems = useMemo(() => (user ? NAV.filter((n) => n.roles.includes(user.role)) : []), [user]);
  // mobile bottom bar: home · role workspace · team (teacher/student) or resources · messages · settings
  const bottomItems = useMemo(() => {
    const at = (h: string) => navItems.find((n) => n.href === h);
    const main = navItems.find((n) => n.href !== "/app" && !["/app/resources", "/app/messages", "/app/settings"].includes(n.href));
    const middle = at("/app/team") ?? at("/app/resources");
    return [at("/app"), main, middle, at("/app/messages"), at("/app/settings")]
      .filter((n): n is NavItem => Boolean(n));
  }, [navItems]);
  const titleKey = TITLE_MAP.find(([p]) => pathname.startsWith(p))?.[1] ?? "nav.home";

  // auth guard: send visitors to the login page once we know there's no session
  useEffect(() => {
    if (state.hydrated && !user) router.replace("/login");
  }, [state.hydrated, user, router]);

  if (!state.hydrated || !user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-paper">
        <Logo />
        <div className="h-1 w-32 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full w-1/2 animate-[marquee_1.2s_linear_infinite] rounded-full bg-gold-500" />
        </div>
      </div>
    );
  }

  const unreadMsg = state.threads.reduce((a, th) => a + th.unread, 0);

  return (
    <div className="min-h-dvh bg-paper">
      {/* ---- desktop sidebar ---- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-hairline-light bg-pine-950 px-4 py-6 md:flex">
        <Link href="/" className="px-2" aria-label="SEC home">
          <Logo dark />
        </Link>
        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {navItems.filter((n) => n.href !== "/app/settings").map((n) => {
            const active = n.href === "/app" ? pathname === "/app" : pathname.startsWith(n.href);
            const Icon = n.icon;
            return (
              <Link key={n.href} href={n.href}
                className={cx(
                  "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                  active ? "bg-cream/10 text-gold-300" : "text-cream/60 hover:bg-cream/5 hover:text-cream"
                )}>
                {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-gold-400" />}
                <Icon size={17} strokeWidth={2.1} />
                {t(n.key)}
                {n.href === "/app/messages" && unreadMsg > 0 && (
                  <span className="ml-auto rounded-full bg-gold-400 px-1.5 py-0.5 text-[10px] font-bold text-ink">{unreadMsg}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="rounded-2xl border border-cream/10 bg-cream/5 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gold-300">
            <Globe size={13} /> {user.country}
          </div>
          <div className="mt-1 line-clamp-1 text-xs text-cream/60">{user.school ?? t("role." + user.role)}</div>
        </div>
      </aside>

      {/* ---- topbar ---- */}
      <header className="sticky top-0 z-30 border-b border-hairline bg-paper/85 backdrop-blur-md md:pl-60">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="md:hidden" aria-label="SEC home"><Logo compact /></Link>
          <h1 className="hidden font-display text-xl font-medium tracking-tight text-ink md:block">{t(titleKey)}</h1>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <LangSwitch />
            <button onClick={() => setSearchOpen(true)} aria-label={t("c.search")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink-2 transition hover:border-gold-500/60 hover:text-ink">
              <Search size={16} />
            </button>
            <button onClick={() => setHelpOpen(true)} aria-label={t("help.title")} title={t("help.title")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/50 bg-gold-400/10 text-gold-700 transition hover:bg-gold-400/20">
              <LifeBuoy size={16} />
            </button>
            <button onClick={() => setNotifsOpen(true)} aria-label={t("c.notifications")}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink-2 transition hover:border-gold-500/60 hover:text-ink">
              <Bell size={16} />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay-500 px-1 text-[9px] font-bold text-cream">
                  {unread}
                </span>
              )}
            </button>
            <div className="relative">
              <button onClick={() => setMenuOpen((v) => !v)} aria-label={t("c.profile")} aria-expanded={menuOpen}>
                <Avatar name={user.name} hue={user.hue} size={36} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }}
                      className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-hairline bg-cream shadow-luxe-lg">
                      <div className="flex items-center gap-3 border-b border-hairline bg-paper p-4">
                        <Avatar name={user.name} hue={user.hue} size={40} />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-ink">{user.name}</div>
                          <div className="truncate text-xs text-ink-2/70">{user.email}</div>
                          <div className="mt-1"><RolePill role={user.role} label={t("role." + user.role)} /></div>
                        </div>
                      </div>
                      <div className="p-1.5 text-sm">
                        <Link href="/app/settings" onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium text-ink hover:bg-paper">
                          <Settings size={15} /> {t("nav.settings")}
                        </Link>
                        <button
                          onClick={() => { setMenuOpen(false); router.push("/login"); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium text-ink hover:bg-paper">
                          <RefreshCcw size={15} /> {t("c.switch")}
                        </button>
                        <button
                          onClick={() => { logout(); toast(t("t.logout"), "info"); router.push("/login"); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium text-clay-600 hover:bg-clay-500/10">
                          <LogOut size={15} /> {t("c.logout")}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ---- page body ---- */}
      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pl-64 md:pr-4 lg:pr-6 xl:max-w-7xl">
        {!online && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-clay-500/40 bg-clay-500/10 px-4 py-2.5 text-xs font-semibold text-clay-600" role="alert">
            <WifiOff size={14} className="shrink-0" /> {t("off.banner")}
          </div>
        )}
        {children}
      </main>

      {/* ---- mobile bottom nav ---- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline-light bg-pine-950/97 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Primary">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${Math.min(5, bottomItems.length)}, 1fr)` }}>
          {bottomItems.slice(0, 5).map((n) => {
            const active = n.href === "/app" ? pathname === "/app" : pathname.startsWith(n.href);
            const Icon = n.icon;
            return (
              <Link key={n.href} href={n.href}
                className={cx("flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition",
                  active ? "text-gold-300" : "text-cream/50")}>
                <span className={cx("relative flex h-8 w-14 items-center justify-center rounded-full transition", active && "bg-cream/10")}>
                  <Icon size={19} strokeWidth={2.1} />
                  {n.href === "/app/messages" && unreadMsg > 0 && (
                    <span className="absolute right-2 top-0.5 h-2 w-2 rounded-full bg-gold-400" />
                  )}
                </span>
                {t(n.key)}
              </Link>
            );
          })}
        </div>
      </nav>

      <NotificationsSheet open={notifsOpen} onClose={() => setNotifsOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AskSec open={helpOpen} onClose={() => setHelpOpen(false)} />
      <ToastHost />
    </div>
  );
}
