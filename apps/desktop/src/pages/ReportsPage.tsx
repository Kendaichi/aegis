import { Download, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import ReportPreviewCard from "../components/reports/ReportPreviewCard";
import ReportsList from "../components/reports/ReportsList";
import { MOCK_REPORT_BY_ASSESSMENT_ID, MOCK_REPORT_LIST } from "../lib/mockData";

const TYPE_FILTERS = ["all", "Flooding", "Landslide", "Typhoon Damage", "Earthquake"] as const;

export default function ReportsPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]>("all");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    let list = MOCK_REPORT_LIST;
    if (typeFilter !== "all") {
      list = list.filter((row) => row.type === typeFilter);
    }

    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) {
      list = list.filter(
        (row) =>
          row.title.toLowerCase().includes(normalizedQuery) ||
          row.location.toLowerCase().includes(normalizedQuery) ||
          row.assessmentId.toLowerCase().includes(normalizedQuery) ||
          row.type.toLowerCase().includes(normalizedQuery)
      );
    }

    return list;
  }, [query, typeFilter]);

  const previewReport =
    selectedAssessmentId && MOCK_REPORT_BY_ASSESSMENT_ID[selectedAssessmentId]
      ? MOCK_REPORT_BY_ASSESSMENT_ID[selectedAssessmentId]
      : null;

  const isOpen = selectedAssessmentId !== null;

  function handleSelect(assessmentId: string) {
    setSelectedAssessmentId((prev) => (prev === assessmentId ? null : assessmentId));
  }

  function handleClose() {
    setSelectedAssessmentId(null);
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-title">Report Archive</p>
          <h1 className="mt-2 text-lg font-semibold text-white">Generated assessment reports</h1>
          <p className="mt-1 text-[13px] text-slate-400">
            Browse, preview, and export field-ready report drafts from completed or in-progress
            assessments.
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
            placeholder="Search reports by title, location, type, or ID..."
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

      {/* Content: horizontal split */}
      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
        {/* Reports list — shrinks to 1/4 when preview is open */}
        <div
          className="min-h-0 min-w-0 overflow-hidden transition-all duration-300 ease-in-out"
          style={{ flex: isOpen ? "0 0 25%" : "1 1 100%" }}
        >
          <ReportsList
            items={filteredRows}
            selectedAssessmentId={selectedAssessmentId ?? ""}
            onSelect={handleSelect}
            compact={isOpen}
          />
        </div>

        {/* Preview panel — slides in from the right */}
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
                <p className="section-title">Preview</p>
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
