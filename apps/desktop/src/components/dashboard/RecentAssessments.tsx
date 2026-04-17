import { ChevronRight } from "lucide-react";
import { MOCK_ASSESSMENTS } from "../../lib/mockData";
import { SeverityBadge, StatusBadge } from "../ui/Badges";

interface Props {
  className?: string;
}

export default function RecentAssessments({ className = "" }: Props) {
  const rows = MOCK_ASSESSMENTS.slice(0, 4);

  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="card-header">
        <div>
          <p className="card-header-title">Recent Assessments</p>
          <h3 className="mt-1 text-base font-semibold text-white">Latest field submissions</h3>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-aegis-accent transition hover:text-blue-300"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="max-h-[19rem] overflow-auto">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead className="sticky top-0 bg-aegis-surface/95 backdrop-blur-xl">
            <tr className="table-header-row">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Assessment</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="table-row-interactive">
                <td className="px-4 py-3 font-mono text-aegis-accent">{r.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-100">{r.title}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{r.subtitle}</div>
                </td>
                <td className="max-w-[180px] px-4 py-3 text-slate-400">{r.location}</td>
                <td className="px-4 py-3 text-slate-400">{r.type}</td>
                <td className="px-4 py-3">
                  <SeverityBadge level={r.severity} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
