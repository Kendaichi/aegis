import { ChevronRight, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { SeverityBadge, StatusBadge } from "../components/ui/Badges";
import { MOCK_ASSESSMENTS, type AssessmentStatus } from "../lib/mockData";

const FILTERS: Array<AssessmentStatus | "all"> = ["all", "complete", "analyzing", "pending"];

interface Props {
  onNewAssessment?: () => void;
  onViewAssessment?: (id: string) => void;
}

export default function AssessmentsPage({ onNewAssessment, onViewAssessment }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  const rows = useMemo(() => {
    let list = MOCK_ASSESSMENTS;
    if (filter !== "all") {
      list = list.filter((r) => r.status === filter);
    }

    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) {
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(normalizedQuery) ||
          r.title.toLowerCase().includes(normalizedQuery) ||
          r.location.toLowerCase().includes(normalizedQuery) ||
          r.type.toLowerCase().includes(normalizedQuery)
      );
    }

    return list;
  }, [filter, query]);

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-title">Assessment Library</p>
          <h1 className="mt-2 text-lg font-semibold text-white">Drone assessment queue</h1>
          <p className="mt-1 text-[13px] text-slate-400">
            {MOCK_ASSESSMENTS.length} total assessments across flood, landslide, and typhoon
            response workflows.
          </p>
        </div>
        <button type="button" onClick={onNewAssessment} className="button-primary">
          <Plus className="h-4 w-4" />
          New Assessment
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search assessments, location, or hazard type..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-shell pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`filter-pill ${filter === value ? "filter-pill-active" : ""}`}
            >
              {value === "all" ? "All" : value}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-[13px]">
            <thead>
              <tr className="table-header-row">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Assessment</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="table-row-interactive cursor-pointer" onClick={() => onViewAssessment?.(r.id)}>
                  <td className="px-4 py-3 font-mono text-aegis-accent">{r.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-100">{r.title}</div>
                    <div className="mt-1 text-[11px] text-slate-500">{r.subtitle}</div>
                  </td>
                  <td className="max-w-[220px] px-4 py-3 text-slate-400">{r.location}</td>
                  <td className="px-4 py-3 text-slate-400">{r.type}</td>
                  <td className="px-4 py-3">
                    <SeverityBadge level={r.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{r.date}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onViewAssessment?.(r.id)}
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-aegis-accent transition hover:text-blue-300"
                    >
                      View
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="p-10 text-center text-sm text-slate-500">
            No assessments match the current filters.
          </p>
        )}
      </div>
    </div>
  );
}
