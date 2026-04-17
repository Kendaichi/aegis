import {
  Clock3,
  MapPinned,
  Radar,
  ScanSearch,
  type LucideIcon,
} from "lucide-react";
import type { DashboardStats } from "../../lib/mockData";

interface Props {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: Props) {
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
      hint: "Across 3 municipalities this week",
      icon: MapPinned,
    },
    {
      label: "Assessments today",
      value: String(stats.assessmentsToday),
      hint: `+${stats.deltaFromYesterday} versus yesterday`,
      icon: ScanSearch,
    },
    {
      label: "Avg assessment time",
      value: `${stats.avgAssessmentTimeMinutes} min`,
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
              <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
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
