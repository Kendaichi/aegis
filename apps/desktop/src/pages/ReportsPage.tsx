import { Download, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReportPreviewCard from "../components/reports/ReportPreviewCard";
import ReportsList from "../components/reports/ReportsList";
import { MOCK_REPORT_BY_ASSESSMENT_ID, MOCK_REPORT_LIST } from "../lib/mockData";

const TYPE_FILTERS = ["all", "Flooding", "Landslide", "Typhoon Damage", "Earthquake"] as const;

export default function ReportsPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]>("all");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(
    MOCK_REPORT_LIST[0]?.assessmentId ?? ""
  );

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

  useEffect(() => {
    if (filteredRows.length === 0) return;
    if (!filteredRows.some((row) => row.assessmentId === selectedAssessmentId)) {
      setSelectedAssessmentId(filteredRows[0].assessmentId);
    }
  }, [filteredRows, selectedAssessmentId]);

  const previewReport =
    filteredRows.length === 0
      ? null
      : selectedAssessmentId && MOCK_REPORT_BY_ASSESSMENT_ID[selectedAssessmentId]
        ? MOCK_REPORT_BY_ASSESSMENT_ID[selectedAssessmentId]
        : null;

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-6">
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

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="min-h-0 xl:col-span-7">
          <ReportsList
            items={filteredRows}
            selectedAssessmentId={selectedAssessmentId}
            onSelect={setSelectedAssessmentId}
          />
        </div>
        <div className="min-h-0 xl:col-span-5">
          <p className="mb-3 section-title">Preview</p>
          <ReportPreviewCard report={previewReport} />
        </div>
      </div>
    </div>
  );
}
