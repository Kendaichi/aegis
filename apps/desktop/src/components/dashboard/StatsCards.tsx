import {
  Clock3,
  MapPinned,
  Radar,
  ScanSearch,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { DashboardStats } from "../../lib/mockData";
import { fetchDashboardStats, subscribeToQueueUpdates } from "../../lib/supabaseQueries";

const EMPTY_STATS: DashboardStats = {
  activeAssessments: { total: 0, inProgress: 0, pending: 0 },
  affectedBarangays: 0,
  assessmentsToday: 0,
  deltaFromYesterday: 0,
  avgAssessmentTimeMinutes: 0,
};

export default function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchDashboardStats();
        if (!cancelled) setStats(next);
      } catch {
        if (!cancelled) setStats(EMPTY_STATS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    const unsubscribe = subscribeToQueueUpdates(() => {
      void load();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const deltaLabel =
    stats.deltaFromYesterday > 0
      ? `+${stats.deltaFromYesterday} versus yesterday`
      : stats.deltaFromYesterday < 0
        ? `${stats.deltaFromYesterday} versus yesterday`
        : "Same as yesterday";

  const cards: Array<{
    label: string;
    value: string;
    hint: string;
    icon: LucideIcon;
  }> = [
    {
      label: "Active assessments",
      value: String(stats.activeAssessments.total),
      hint: `${stats.activeAssessments.inProgress} in progress, ${stats.activeAssessments.pending} pending`,
      icon: Radar,
    },
    {
      label: "Affected barangays",
      value: String(stats.affectedBarangays),
      hint: stats.affectedBarangays === 0 ? "No completed assessments yet" : "From completed assessments",
      icon: MapPinned,
    },
    {
      label: "Assessments today",
      value: String(stats.assessmentsToday),
      hint: deltaLabel,
      icon: ScanSearch,
    },
    {
      label: "Avg assessment time",
      value: stats.avgAssessmentTimeMinutes > 0 ? `${stats.avgAssessmentTimeMinutes} min` : "—",
      hint: "From upload to report",
      icon: Clock3,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, hint, icon: Icon }) => (
        <div key={label} className="card p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-title">{label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {loading ? "…" : value}
              </p>
              <p className="mt-2 text-[13px] text-slate-400">{hint}</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-aegis-border bg-aegis-glow text-aegis-accent shadow-glow">
              <Icon className="h-5 w-5" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
