"use client";

/* UI primitives — the shared visual vocabulary of the platform.
   Kept deliberately conventional: every component is a plain React function
   with Tailwind classes. Icons come from lucide-react. */

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, Loader2, X, XCircle } from "lucide-react";
import clsx from "clsx";
import { useApp } from "@/lib/store";
import { initials } from "@/lib/utils";
import type { Role, MilestoneStatus } from "@/lib/types";

export const cx = clsx;

/* ---------- online/offline awareness ---------- */

export function useOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

/* ---------- buttons ---------- */

type BtnVariant = "primary" | "dark" | "outline" | "ghost" | "gold" | "danger";

export function Button({
  children, variant = "primary", size = "md", className, loading, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" | "lg"; loading?: boolean }) {
  const styles: Record<BtnVariant, string> = {
    primary: "bg-pine-800 text-cream hover:bg-pine-700 shadow-luxe",
    dark: "bg-ink text-cream hover:bg-pine-900",
    gold: "bg-gold-400 text-ink hover:bg-gold-300 shadow-luxe",
    outline: "border border-hairline bg-cream text-ink hover:border-gold-500/60 hover:bg-cream-2",
    ghost: "text-ink-2 hover:bg-ink/5",
    danger: "bg-clay-500 text-cream hover:bg-clay-600",
  };
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base" };
  return (
    <button
      className={cx(
        "inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        styles[variant], sizes[size], className
      )}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

/* ---------- surfaces ---------- */

export function Card({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("rounded-2xl border border-hairline bg-cream shadow-luxe", className)} {...rest}>
      {children}
    </div>
  );
}

export function SectionHead({
  kicker, title, action, className,
}: { kicker?: string; title: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cx("mb-4 flex items-end justify-between gap-3", className)}>
      <div>
        {kicker && (
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-600">{kicker}</div>
        )}
        <h2 className="font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* ---------- pills & badges ---------- */

const statusStyles: Record<MilestoneStatus, string> = {
  locked: "bg-ink/5 text-ink-2",
  open: "bg-sky-500/10 text-sky-500",
  draft: "bg-plum-500/10 text-plum-500",
  awaiting_teacher: "bg-gold-400/20 text-gold-700",
  submitted: "bg-gold-400/20 text-gold-700",
  reviewed: "bg-pine-100 text-pine-700",
  returned: "bg-clay-500/10 text-clay-600",
};

export function StatusPill({ status, label }: { status: MilestoneStatus; label: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", statusStyles[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

const roleStyles: Record<Role, string> = {
  student: "bg-sky-500/10 text-sky-500",
  teacher: "bg-pine-100 text-pine-700",
  reviewer: "bg-plum-500/10 text-plum-500",
  partner: "bg-clay-500/10 text-clay-600",
  admin: "bg-gold-400/20 text-gold-700",
};

export function RolePill({ role, label }: { role: Role; label: string }) {
  return <span className={cx("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", roleStyles[role])}>{label}</span>;
}

export function CodeChip({ code }: { code: string }) {
  return (
    <span className="inline-flex h-6 min-w-8 items-center justify-center rounded-md border border-hairline bg-paper px-1.5 text-[10px] font-bold tracking-widest text-ink-2">
      {code}
    </span>
  );
}

/* ---------- avatar ---------- */

export function Avatar({ name, hue = 160, size = 40, className }: { name: string; hue?: number; size?: number; className?: string }) {
  return (
    <div
      className={cx("flex shrink-0 items-center justify-center rounded-full font-bold text-cream ring-2 ring-cream", className)}
      style={{
        width: size, height: size, fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${hue}, 38%, 30%), hsl(${(hue + 40) % 360}, 45%, 48%))`,
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

/* ---------- form controls ---------- */

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-2">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-2/70">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-hairline bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(inputCls, props.className)} {...props} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(inputCls, "min-h-24 resize-y", props.className)} {...props} />;
}
export function Select({ children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(inputCls, "appearance-auto")} {...rest}>
      {children}
    </select>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? "toggle"}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-pine-700" : "bg-ink/20"
      )}
    >
      <span
        className={cx(
          "absolute top-0.5 h-5 w-5 rounded-full bg-cream shadow transition-all",
          checked ? "left-[1.375rem]" : "left-0.5"
        )}
      />
    </button>
  );
}

/* ---------- progress ---------- */

export function ProgressBar({ value, max = 100, className }: { value: number; max?: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cx("h-1.5 overflow-hidden rounded-full bg-ink/10", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-300 transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ---------- modal & sheet ---------- */

export function Modal({
  open, onClose, title, children, wide,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            className={cx(
              "flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-hairline bg-cream shadow-luxe-lg sm:rounded-3xl",
              wide ? "sm:max-w-2xl" : "sm:max-w-md"
            )}
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <h3 className="font-display text-lg font-medium text-ink">{title}</h3>
              <button onClick={onClose} className="rounded-full p-1.5 text-ink-2 hover:bg-ink/5" aria-label="Close dialog">
                <X size={18} />
              </button>
            </div>
            <div className="thin-scroll overflow-y-auto px-5 py-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Sheet({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            role="dialog" aria-label={title}
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-hairline bg-cream shadow-luxe-lg"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <h3 className="font-display text-lg font-medium">{title}</h3>
              <button onClick={onClose} className="rounded-full p-1.5 text-ink-2 hover:bg-ink/5" aria-label="Close panel">
                <X size={18} />
              </button>
            </div>
            <div className="thin-scroll flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- toasts (rendered once by the shell) ---------- */

function ToastItem({ id, title, body, kind }: { id: string; title: string; body?: string; kind: "success" | "info" | "error" }) {
  const { dispatch } = useApp();
  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: "REMOVE_TOAST", id }), 3600);
    return () => clearTimeout(t);
  }, [id, dispatch]);
  const Icon = kind === "success" ? CheckCircle2 : kind === "error" ? XCircle : Info;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8 }}
      className="pointer-events-auto flex w-[min(92vw,360px)] items-start gap-3 rounded-2xl border border-hairline-light bg-pine-950/95 p-4 text-cream shadow-luxe-lg backdrop-blur"
      role="status"
    >
      <Icon size={18} className={cx("mt-0.5 shrink-0", kind === "success" ? "text-gold-400" : kind === "error" ? "text-clay-400" : "text-pine-200")} />
      <div className="min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        {body && <div className="mt-0.5 text-xs text-cream/70">{body}</div>}
      </div>
      <button
        className="ml-auto rounded-full p-1 text-cream/50 hover:text-cream"
        onClick={() => dispatch({ type: "REMOVE_TOAST", id })}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastHost() {
  const { state } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-6">
      <AnimatePresence>
        {state.toasts.map((t) => <ToastItem key={t.id} {...t} />)}
      </AnimatePresence>
    </div>
  );
}

/* ---------- misc ---------- */

export function EmptyState({ title, body, icon }: { title: string; body?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-hairline bg-cream-2/50 px-6 py-12 text-center">
      {icon && <div className="mb-1 text-ink/30">{icon}</div>}
      <div className="font-display text-lg text-ink">{title}</div>
      {body && <p className="max-w-sm text-sm text-ink-2/80">{body}</p>}
    </div>
  );
}

export function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <Card className="p-4">
      <div className={cx("font-display text-2xl font-medium tracking-tight sm:text-3xl", accent ? "gold-text" : "text-ink")}>{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink-2">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-pine-700">{sub}</div>}
    </Card>
  );
}

export function Tabs<T extends string>({
  options, value, onChange, className,
}: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cx("no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-hairline bg-paper p-1", className)}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cx(
            "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
            value === o.id ? "bg-ink text-cream shadow" : "text-ink-2 hover:text-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- rubric score bars (read-only display) ---------- */

export function ScoreBars({ criteria, labels }: { criteria: number[]; labels: string[] }) {
  return (
    <div className="space-y-2.5">
      {criteria.map((c, i) => (
        <div key={i}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-ink-2">{labels[i] ?? `Criterion ${i + 1}`}</span>
            <span className="font-bold text-ink">{c}/10</span>
          </div>
          <ProgressBar value={c} max={10} />
        </div>
      ))}
    </div>
  );
}

/* ---------- scroll reveal + count-up (landing magic) ---------- */

export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setInView(true), obs.disconnect()),
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={cx("rv", inView && "is-in", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function CountUp({ to, suffix = "", duration = 1600 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(to * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);
  return <span ref={ref}>{val.toLocaleString("en-GB")}{suffix}</span>;
}
