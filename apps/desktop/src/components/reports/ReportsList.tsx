import type { ReportListItem } from "../../lib/mockData";
import { SeverityBadge, StatusBadge } from "../ui/Badges";

interface Props {
  items: ReportListItem[];
  selectedAssessmentId: string;
  onSelect: (assessmentId: string) => void;
  compact?: boolean;
}

export default function ReportsList({ items, selectedAssessmentId, onSelect, compact }: Props) {
  return (
    <div className="card h-full overflow-hidden">
      <div className="max-h-full overflow-y-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="sticky top-0 z-[1] bg-aegis-surface/95 backdrop-blur-xl">
            <tr className="table-header-row">
              <th className="px-4 py-3 font-medium">Report</th>
              {!compact && <th className="px-4 py-3 font-medium">Location</th>}
              {!compact && <th className="px-4 py-3 font-medium">Type</th>}
              <th className="px-4 py-3 font-medium">Severity</th>
              {!compact && <th className="px-4 py-3 font-medium">Status</th>}
              {!compact && <th className="px-4 py-3 font-medium">Date</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const selected = selectedAssessmentId === row.assessmentId;
              return (
                <tr
                  key={row.id}
                  className={`cursor-pointer border-b border-aegis-border/80 transition last:border-0 hover:bg-white/[0.03] ${
                    selected ? "bg-aegis-glow" : ""
                  }`}
                  onClick={() => onSelect(row.assessmentId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(row.assessmentId);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <td
                    className={`px-4 py-3 ${selected ? "border-l-2 border-aegis-accent" : ""}`}
                  >
                    <div className="font-mono text-[11px] text-aegis-accent">{row.id}</div>
                    <div className="mt-1 font-medium text-slate-100">{row.title}</div>
                    {compact && (
                      <div className="mt-1 text-[11px] text-slate-500">{row.location}</div>
                    )}
                    <div className="mt-1 text-[11px] text-slate-500">{row.pages} pages</div>
                  </td>
                  {!compact && (
                    <td className="max-w-[200px] px-4 py-3 text-slate-400">{row.location}</td>
                  )}
                  {!compact && <td className="px-4 py-3 text-slate-400">{row.type}</td>}
                  <td className="px-4 py-3">
                    <SeverityBadge level={row.severity} />
                  </td>
                  {!compact && (
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                  )}
                  {!compact && (
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{row.date}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {items.length === 0 && (
        <p className="p-8 text-center text-sm text-slate-500">No reports match your filters.</p>
      )}
    </div>
  );
}
