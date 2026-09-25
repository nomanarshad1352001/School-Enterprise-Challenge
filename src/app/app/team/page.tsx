"use client";

/* My team — roster, roles, guardian-consent tracking, invite code and
   achievement badges. Consent switches exist because SEC users are minors:
   a team cannot graduate with unconsented members. */

import { useState } from "react";
import { Award, ClipboardList, Coins, Copy, Lightbulb, ShieldCheck, Sprout, Trash2, Trophy, UserPlus } from "lucide-react";
import { useApp } from "@/lib/store";
import { Avatar, Button, Card, cx, Field, Input, Modal, SectionHead, Select, Switch } from "@/components/ui";
import { fmtNum, uid } from "@/lib/utils";

const MEMBER_ROLES = ["Team Captain", "Finance Lead", "Marketing Lead", "Operations", "Production", "Sales"];

const BADGES = [
  { icon: Sprout, name: "First Steps", need: 0 },
  { icon: Lightbulb, name: "Idea Validated", need: 1 },
  { icon: ClipboardList, name: "Plan Approved", need: 2 },
  { icon: Coins, name: "First Sales", need: 3 },
  { icon: Trophy, name: "Reporter", need: 4 },
];

export default function TeamPage() {
  const { state, t, myPersistentTeams, activeTeam, dispatch, toast } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState(MEMBER_ROLES[0]);
  const [consent, setConsent] = useState(false);

  const inviteCode = activeTeam.name.slice(0, 3).toUpperCase() + "-" + (4820 + (activeTeam.hue % 90)) + "X";

  const addMember = () => {
    if (!name.trim()) return;
    dispatch({ type: "ADD_MEMBER", teamId: activeTeam.id, member: { id: uid("tm"), name: name.trim(), role, consent } });
    toast(t("t.memberAdded"), "success", name);
    setName(""); setConsent(false); setAddOpen(false);
  };

  const copy = () => {
    void navigator.clipboard?.writeText(inviteCode).catch(() => undefined);
    toast(t("c.copied"), "success", inviteCode);
  };

  return (
    <div className="space-y-5">
      {/* team header */}
      <Card className="grain relative overflow-hidden bg-pine-950 p-6 text-cream">
        <div className="relative flex flex-wrap items-center gap-4">
          <Avatar name={activeTeam.name} hue={activeTeam.hue} size={64} className="ring-gold-400/60" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {myPersistentTeams.map((tm) => (
                <button key={tm.id} onClick={() => dispatch({ type: "SET_ACTIVE_TEAM", id: tm.id })}
                  className={cx("rounded-full border px-3 py-1.5 text-xs font-bold transition",
                    tm.id === activeTeam.id ? "border-gold-400 bg-gold-400/20 text-gold-200" : "border-cream/20 text-cream/60 hover:border-cream/40")}>
                  {tm.name}
                </button>
              ))}
            </div>
            <h2 className="mt-3 font-display text-2xl font-light">{activeTeam.name}</h2>
            <p className="text-sm text-cream/60">{activeTeam.school} · {activeTeam.country}</p>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl gold-text">{fmtNum(activeTeam.points)}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-cream/50">{t("c.points")}</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* roster */}
        <Card className="p-5">
          <SectionHead
            title={`${t("c.members")} (${activeTeam.members.length})`}
            action={<Button variant="gold" size="sm" onClick={() => setAddOpen(true)}><UserPlus size={14} /> {t("c.add")}</Button>}
          />
          <div className="space-y-2">
            {activeTeam.members.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-hairline bg-paper p-3.5">
                <Avatar name={m.name} hue={m.name.charCodeAt(0) * 11} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-ink">{m.name}</div>
                  <div className={cx("mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold", m.consent ? "text-pine-700" : "text-clay-600")}>
                    <ShieldCheck size={12} /> {m.consent ? "Guardian consent on file" : "Consent pending"}
                  </div>
                </div>
                <Select value={m.role} onChange={(e) => dispatch({ type: "SET_MEMBER_ROLE", teamId: activeTeam.id, memberId: m.id, role: e.target.value })}
                  className="w-36 !py-1.5 text-xs">
                  {MEMBER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </Select>
                <Switch checked={m.consent} onChange={() => dispatch({ type: "TOGGLE_CONSENT", teamId: activeTeam.id, memberId: m.id })} label="Guardian consent" />
                <button onClick={() => { dispatch({ type: "REMOVE_MEMBER", teamId: activeTeam.id, memberId: m.id }); toast(t("t.memberRemoved"), "info"); }}
                  className="rounded-full p-2 text-clay-600 transition hover:bg-clay-500/10" aria-label={t("c.remove")}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          {/* invite */}
          <Card className="p-5">
            <SectionHead title={t("dash.qaInvite")} />
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-dashed border-gold-500/60 bg-gold-400/10 px-4 py-3 text-center font-mono text-lg font-bold tracking-[0.2em] text-gold-700">
                {inviteCode}
              </div>
              <Button variant="outline" size="sm" onClick={copy} aria-label={t("c.copy")}><Copy size={14} /></Button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-2/70">
              Share this code with your students — they enter it during sign-up to join this team.
            </p>
          </Card>

          {/* badges */}
          <Card className="p-5">
            <SectionHead title="Badges" />
            <div className="grid grid-cols-5 gap-2">
              {BADGES.map((b) => {
                const earned = (activeTeam.progress[b.need]?.status === "reviewed");
                return (
                  <div key={b.name} className="flex flex-col items-center gap-1.5 text-center">
                    <span className={cx(
                      "flex h-12 w-12 items-center justify-center rounded-full border transition",
                      earned ? "border-gold-400 bg-gold-400/20 text-gold-700" : "border-hairline bg-paper text-ink/25"
                    )}>
                      <b.icon size={18} />
                    </span>
                    <span className={cx("text-[9px] font-bold uppercase leading-tight tracking-wide", earned ? "text-ink" : "text-ink/35")}>{b.name}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* awards teaser */}
          <Card className="grain relative overflow-hidden bg-pine-950 p-5 text-cream">
            <div className="relative flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400 text-ink"><Award size={18} /></span>
              <div>
                <div className="font-display text-base">SEC Global Awards</div>
                <div className="text-xs text-cream/60">Gold · Silver · Bronze — June 2026</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* add member modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t("dash.qaInvite")}>
        <div className="space-y-4">
          <Field label={t("s.name")}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="First name + initial" autoFocus />
          </Field>
          <Field label={t("a.colRole")}>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              {MEMBER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
          <label className="flex items-start gap-3 rounded-xl border border-hairline bg-paper p-3.5 text-sm">
            <Switch checked={consent} onChange={setConsent} label="Guardian consent" />
            <span>
              <span className="font-semibold text-ink">Guardian consent on file</span>
              <span className="mt-0.5 block text-xs text-ink-2/75">Required for all members under 18 — see Safeguarding in Settings.</span>
            </span>
          </label>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>{t("c.cancel")}</Button>
            <Button variant="gold" className="flex-1" onClick={addMember} disabled={!name.trim()}>{t("c.add")}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
