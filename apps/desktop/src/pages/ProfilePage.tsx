import { Activity, Mail, MapPinned, Phone, ShieldCheck, UserCircle2 } from "lucide-react";
import { PROFILE_SUMMARY } from "../lib/mockData";

interface Props {
  onOpenWorkspace: () => void;
}

export default function ProfilePage({ onOpenWorkspace }: Props) {
  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-6">
      <header className="card p-6">
        <div className="flex flex-wrap items-start gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-aegis-accent text-2xl font-semibold text-white shadow-glow">
            {PROFILE_SUMMARY.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="section-title">Operator Identity</p>
            <h1 className="mt-2 text-xl font-semibold text-white">{PROFILE_SUMMARY.name}</h1>
            <p className="mt-1 text-[13px] text-slate-400">
              {PROFILE_SUMMARY.role} assigned to {PROFILE_SUMMARY.region}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
                {PROFILE_SUMMARY.status}
              </span>
              <span className="rounded-full border border-aegis-border bg-aegis-surface2 px-3 py-1 text-[11px] font-medium text-slate-300">
                Clearance {PROFILE_SUMMARY.clearance}
              </span>
            </div>
          </div>
          <button type="button" onClick={onOpenWorkspace} className="button-primary">
            Resume Workspace
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="card p-5 xl:col-span-7">
          <p className="section-title">Contact Details</p>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-aegis-border bg-aegis-surface2/80 p-4">
              <div className="flex items-center gap-2 text-slate-200">
                <Mail className="h-4 w-4 text-aegis-accent" />
                Email
              </div>
              <p className="mt-2 text-[13px] text-slate-400">{PROFILE_SUMMARY.email}</p>
            </div>
            <div className="rounded-2xl border border-aegis-border bg-aegis-surface2/80 p-4">
              <div className="flex items-center gap-2 text-slate-200">
                <Phone className="h-4 w-4 text-aegis-accent" />
                Phone
              </div>
              <p className="mt-2 text-[13px] text-slate-400">{PROFILE_SUMMARY.phone}</p>
            </div>
            <div className="rounded-2xl border border-aegis-border bg-aegis-surface2/80 p-4">
              <div className="flex items-center gap-2 text-slate-200">
                <MapPinned className="h-4 w-4 text-aegis-accent" />
                Region
              </div>
              <p className="mt-2 text-[13px] text-slate-400">{PROFILE_SUMMARY.region}</p>
            </div>
            <div className="rounded-2xl border border-aegis-border bg-aegis-surface2/80 p-4">
              <div className="flex items-center gap-2 text-slate-200">
                <UserCircle2 className="h-4 w-4 text-aegis-accent" />
                Team
              </div>
              <p className="mt-2 text-[13px] text-slate-400">{PROFILE_SUMMARY.team}</p>
            </div>
          </div>
        </section>

        <section className="card p-5 xl:col-span-5">
          <p className="section-title">Operational Readiness</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-aegis-border bg-aegis-surface2/80 p-4">
              <div className="flex items-center gap-2 text-slate-200">
                <ShieldCheck className="h-4 w-4 text-aegis-accent" />
                Missions completed
              </div>
              <p className="mt-2 text-3xl font-semibold text-white">
                {PROFILE_SUMMARY.missionsCompleted}
              </p>
            </div>
            <div className="rounded-2xl border border-aegis-border bg-aegis-surface2/80 p-4">
              <div className="flex items-center gap-2 text-slate-200">
                <Activity className="h-4 w-4 text-aegis-accent" />
                Response readiness
              </div>
              <p className="mt-2 text-3xl font-semibold text-white">
                {PROFILE_SUMMARY.responseReadinessPct}%
              </p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-aegis-surface">
                <div
                  className="h-full rounded-full bg-aegis-accent"
                  style={{ width: `${PROFILE_SUMMARY.responseReadinessPct}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
