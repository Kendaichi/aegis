import type { AssessmentStatus, SeverityLevel } from "../../lib/mockData";

const severityStyles: Record<SeverityLevel, string> = {
  5: "border border-red-500/30 bg-red-500/15 text-red-100",
  4: "border border-orange-500/30 bg-orange-500/15 text-orange-100",
  3: "border border-amber-500/30 bg-amber-500/18 text-amber-100",
  2: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-100",
};

const statusStyles: Record<AssessmentStatus, string> = {
  complete: "border border-emerald-500/25 bg-emerald-500/12 text-emerald-200",
  analyzing: "border border-aegis-accent/25 bg-aegis-glow text-blue-100",
  pending: "border border-slate-500/25 bg-slate-500/10 text-slate-300",
};

export function SeverityBadge({ level }: { level: SeverityLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${severityStyles[level]}`}
    >
      SEV {level}
    </span>
  );
}

export function StatusBadge({ status }: { status: AssessmentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[status]}`}
    >
      {status === "analyzing" && (
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-aegis-accent" />
      )}
      {status === "complete" && "Complete"}
      {status === "analyzing" && "Analyzing..."}
      {status === "pending" && "Pending"}
    </span>
  );
}
