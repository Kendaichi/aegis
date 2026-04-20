import { Download, Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReportPreviewCard from "../components/reports/ReportPreviewCard";
import { BrandedLoaderInline } from "../components/ui/BrandedLoader";
import ReportsList from "../components/reports/ReportsList";
import { api, type Report } from "../lib/api";
import { reportToListItem } from "../lib/assessments";
import type { ReportListItem } from "../lib/mockData";

const TYPE_FILTERS = ["all", "severe", "moderate", "minor"] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];

export default function ReportsPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<Report | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .listReports()
      .then((list) => {
        if (cancelled) return;
        setReports(list);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows: ReportListItem[] = useMemo(() => reports.map((r) => reportToListItem(r)), [reports]);

  const filteredRows = useMemo(() => {
    let list = rows;
    if (typeFilter !== "all") {
      const severityFilter = typeFilter;
      list = list.filter((row) => {
        const match = reports.find((r) => r.report_id === row.id);
        return match?.overall_severity === severityFilter;
      });
    }

    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) {
      list = list.filter(
        (row) =>
          row.title.toLowerCase().includes(normalizedQuery) ||
          row.location.toLowerCase().includes(normalizedQuery) ||
          row.assessmentId.toLowerCase().includes(normalizedQuery) ||
          row.id.toLowerCase().includes(normalizedQuery)
      );
    }

    return list;
  }, [query, reports, rows, typeFilter]);

  function handleSelect(assessmentId: string) {
    if (selectedAssessmentId === assessmentId) {
      setSelectedAssessmentId(null);
      setPreviewReport(null);
      return;
    }
    setSelectedAssessmentId(assessmentId);
    const row = rows.find((r) => r.assessmentId === assessmentId);
    if (!row) return;

    const cached = reports.find((r) => r.report_id === row.id);
    if (cached) setPreviewReport(cached);

    setPreviewLoading(true);
    api
      .getReport(row.id)
      .then((fresh) => setPreviewReport(fresh))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setPreviewLoading(false));
  }

  function handleClose() {
    setSelectedAssessmentId(null);
    setPreviewReport(null);
  }

  const isOpen = selectedAssessmentId !== null;

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-title">Report Archive</p>
          <h1 className="mt-2 text-lg font-semibold text-white">Generated assessment reports</h1>
          <p className="mt-1 text-[13px] text-slate-400">
            {loading
              ? "Loading reports..."
              : `${reports.length} reports synced from the AEGIS backend.`}
          </p>
        </div>
        <button type="button" className="button-secondary">
          <Download className="h-4 w-4" />
          Export Queue
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search reports by title, location, or ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-shell pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTypeFilter(value)}
              className={`filter-pill ${typeFilter === value ? "filter-pill-active" : ""}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="card border border-red-500/30 bg-red-500/5 p-4 text-[13px] text-red-200">
          {error}
        </div>
      )}

      {/* Content: horizontal split */}
      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
        <div
          className="min-h-0 min-w-0 overflow-hidden transition-all duration-300 ease-in-out"
          style={{ flex: isOpen ? "0 0 25%" : "1 1 100%" }}
        >
          {loading ? (
            <div className="card flex h-full items-center justify-center p-10">
              <BrandedLoaderInline message="Syncing reports…" />
            </div>
          ) : (
            <ReportsList
              items={filteredRows}
              selectedAssessmentId={selectedAssessmentId ?? ""}
              onSelect={handleSelect}
              compact={isOpen}
            />
          )}
        </div>

        <div
          className="min-h-0 min-w-0 overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            flex: isOpen ? "1 1 75%" : "0 0 0%",
            opacity: isOpen ? 1 : 0,
          }}
        >
          {isOpen && (
            <div className="flex h-full flex-col">
              <div className="mb-2 flex items-center justify-between">
                <p className="section-title">
                  Preview {previewLoading && <Loader2 className="ml-2 inline h-3 w-3 animate-spin" />}
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-aegis-border bg-aegis-surface2 text-slate-400 transition hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <ReportPreviewCard report={previewReport} assessmentId={selectedAssessmentId ?? undefined} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
