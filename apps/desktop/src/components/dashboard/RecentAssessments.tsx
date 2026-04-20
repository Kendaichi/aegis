import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { AssessmentRow } from "../../lib/mockData";
import { fetchRecentAssessments, subscribeToQueueUpdates } from "../../lib/supabaseQueries";
import { BrandedLoaderInline } from "../ui/BrandedLoader";
import { SeverityBadge, StatusBadge } from "../ui/Badges";

interface Props {
  className?: string;
  onViewAssessment?: (videoId: string) => void;
}

export default function RecentAssessments({ className = "", onViewAssessment }: Props) {
  const [rows, setRows] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchRecentAssessments(4);
        if (cancelled) return;
        setRows(next);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load assessments");
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
              <tr
                key={r.videoId}
                className="table-row-interactive cursor-pointer"
                onClick={() => onViewAssessment?.(r.videoId)}
              >
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
        {loading && rows.length === 0 && (
          <BrandedLoaderInline message="Loading assessments…" className="p-6" />
        )}
        {!loading && rows.length === 0 && !error && (
          <p className="p-6 text-center text-[12px] text-slate-500">
            No assessments yet — upload a video to get started.
          </p>
        )}
        {error && (
          <p className="p-6 text-center text-[12px] text-red-300">{error}</p>
        )}
      </div>
    </div>
  );
}
