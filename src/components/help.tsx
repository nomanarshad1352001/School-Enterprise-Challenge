"use client";

/* "Ask SEC" — an instant handbook assistant available to every role from the
   top bar. It is deliberately NOT generative AI: answers come from a curated
   FAQ bank via keyword matching, and the screen says so clearly (honesty rule:
   never let users confuse an automatic answer with a human reply). */

import { useMemo, useState } from "react";
import { LifeBuoy, Search, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import type { LocalText } from "@/lib/types";
import { Sheet, cx } from "@/components/ui";

interface Faq { q: LocalText; a: LocalText; tags: string }

const FAQ: Faq[] = [
  { q: { en: "When is the next deadline?", es: "¿Cuándo es la próxima fecha límite?" },
    a: { en: "The Business Plan closes on 12 December, 23:59 local time. Upload early — slow internet is common at deadline time, and drafts autosave as you type.", es: "El Plan de Negocio cierra el 12 de diciembre a las 23:59 hora local. Sube antes — el internet suele ir lento en la fecha límite, y los borradores se guardan solos." },
    tags: "deadline date due when close fecha límite" },
  { q: { en: "How do I submit evidence?", es: "¿Cómo envío la evidencia?" },
    a: { en: "Open Journey → the current milestone → write your answers and add photos or documents (up to 6) → press Submit. Photos are compressed automatically to save your data.", es: "Abre Ruta → el hito actual → escribe tus respuestas y añade fotos o documentos (hasta 6) → pulsa Enviar. Las fotos se comprimen solas para ahorrar datos." },
    tags: "submit upload evidence file photo document subir enviar" },
  { q: { en: "Why was my submission returned?", es: "¿Por qué me devolvieron la entrega?" },
    a: { en: "A judge returned it with notes so you can improve — it is not a fail. Read the feedback on the milestone, update your work and resubmit. Most gold winners resubmitted at least once!", es: "Un juez la devolvió con notas para que la mejores — no es un suspenso. Lee los comentarios del hito, actualiza tu trabajo y reenvíalo. ¡La mayoría de ganadores reenvió al menos una vez!" },
    tags: "returned rejected feedback revise improve devuelto rechazado" },
  { q: { en: "How are scores calculated?", es: "¿Cómo se calculan las notas?" },
    a: { en: "Judges score every rubric criterion from 0–10; the total is scaled to 100. Your rubric bars on the milestone show exactly where points were won and lost.", es: "Los jueces puntúan cada criterio de 0 a 10; el total se escala a 100. Las barras de la rúbrica en el hito muestran dónde ganaste y perdiste puntos." },
    tags: "score points rubric grade nota puntos" },
  { q: { en: "Can students log in themselves?", es: "¿Pueden los estudiantes entrar solos?" },
    a: { en: "Yes — students have a view of their team's journey and can draft work, but everything they submit waits for teacher approval before it reaches the judges. Adults are always verified.", es: "Sí — los estudiantes ven la ruta de su equipo y pueden redactar trabajo, pero todo lo que envíen espera la aprobación del docente antes de llegar a los jueces. Los adultos siempre se verifican." },
    tags: "student login minor child safety estudiante acceso" },
  { q: { en: "How do I add a team member?", es: "¿Cómo añado un miembro al equipo?" },
    a: { en: "Go to My Team → Add. First names only — and remember guardian consent must be switched on for every member under 18.", es: "Ve a Mi Equipo → Añadir. Solo nombres de pila — y recuerda activar el consentimiento del adulto para cada menor de 18." },
    tags: "member add invite team consent miembro invitar" },
  { q: { en: "Is my work saved if my internet drops?", es: "¿Se guarda mi trabajo si se cae el internet?" },
    a: { en: "Yes. Drafts autosave onto this device every second as you type, and everything else (scores, messages, settings) survives reloads. You will see an offline banner when disconnected.", es: "Sí. Los borradores se guardan en este dispositivo cada segundo mientras escribes, y todo lo demás (notas, mensajes, ajustes) sobrevive las recargas. Verás un aviso cuando no haya conexión." },
    tags: "offline internet connection save draft sin conexión guardar" },
  { q: { en: "How do I change the language?", es: "¿Cómo cambio el idioma?" },
    a: { en: "Use the EN/ES pill in the top bar of any page, or Settings → Language. Everything switches instantly, including dates of announcements.", es: "Usa el selector EN/ES en la barra superior de cualquier página, o Ajustes → Idioma. Todo cambia al instante." },
    tags: "language spanish english idioma español inglés" },
  { q: { en: "What do partners see?", es: "¿Qué ven los socios?" },
    a: { en: "Partner staff see only the schools and teams in their own scope: KPIs, trends, at-risk teams and CSV exports — never other regions' data.", es: "Los socios solo ven escuelas y equipos de su propio ámbito: indicadores, tendencias, equipos en riesgo y exportaciones CSV — nunca datos de otras regiones." },
    tags: "partner region scope access socio región" },
  { q: { en: "How do I report a safety concern?", es: "¿Cómo reporto un problema de seguridad?" },
    a: { en: "Use the flag icon on any chat message, or Settings → Safeguarding → Report a concern. The TAMTF safeguarding lead reviews every flag within 24 hours.", es: "Usa la bandera en cualquier mensaje, o Ajustes → Protección → Reportar. La responsable de protección revisa cada marca en 24 horas." },
    tags: "safety report abuse flag safeguarding protección reportar abuso" },
];

/** naive keyword scorer — deliberately simple & explainable */
function score(q: string, entry: Faq, lang: "en" | "es"): number {
  const words = q.toLowerCase().split(/[^a-záéíóúñü]+/).filter((w) => w.length > 2);
  if (!words.length) return 0;
  const hay = `${entry.q[enLang(lang)]} ${entry.tags}`.toLowerCase();
  return words.reduce((a, w) => a + (hay.includes(w) ? 1 : 0), 0);
}
const enLang = (lang: "en" | "es") => lang;

export function AskSec({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useApp();
  const [q, setQ] = useState("");

  const matches = useMemo(() => {
    if (!q.trim()) return FAQ.slice(0, 3);
    return FAQ.map((f) => ({ f, s: score(q, f, lang) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((r) => r.f);
  }, [q, lang]);

  return (
    <Sheet open={open} onClose={onClose} title={t("help.title")}>
      <div className="flex h-full flex-col">
        <div className="border-b border-hairline bg-paper px-5 py-4">
          <p className="text-xs text-ink-2/80">{t("help.sub")}</p>
          <div className="relative mt-3">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2/40" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("help.ph")} autoFocus
              className="w-full rounded-full border border-hairline bg-cream py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold-500" />
          </div>
        </div>
        <div className="flex items-center gap-2 border-b border-hairline bg-gold-400/10 px-5 py-2.5 text-[11px] font-semibold text-gold-700">
          <Sparkles size={12} className="shrink-0" /> {t("help.auto")}
        </div>
        <div className="thin-scroll flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
          {matches.length === 0 && (
            <div className="rounded-2xl border border-dashed border-hairline p-6 text-center text-sm text-ink-2/80">{t("help.none")}</div>
          )}
          {matches.length > 0 && (
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-2/60">{t("help.top")}</div>
          )}
          {matches.map((f, i) => (
            <details key={i} className="group rounded-2xl border border-hairline bg-paper transition open:border-gold-500/50 open:bg-cream" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center gap-2.5 p-4 text-sm font-bold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-400/20 text-gold-700"><LifeBuoy size={13} /></span>
                {f.q[lang]}
              </summary>
              <p className="px-4 pb-4 pl-[52px] text-sm leading-relaxed text-ink-2">{f.a[lang]}</p>
            </details>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
