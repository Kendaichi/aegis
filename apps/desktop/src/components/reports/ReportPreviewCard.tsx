import { Braces, FileDown, FileText, Share2 } from "lucide-react";
import { useState } from "react";
import type { Report } from "../../lib/api";
import { downloadReportPdf } from "../../lib/exportReport";
import ReportView from "../Report";

type ViewMode = "report" | "json";

interface Props {
  report: Report | null;
  assessmentId?: string;
}

export default function ReportPreviewCard({ report, assessmentId }: Props) {
  const [view, setView] = useState<ViewMode>("report");

  if (!report) {
    return (
      <div className="card flex h-full items-center justify-center p-8 text-center text-sm text-slate-500">
        Select a report from the list to preview the executive summary and recommendations.
      </div>
    );
  }

  return (
    <div className="card flex h-full min-h-0 flex-col overflow-hidden">
      <div className="card-header flex-wrap gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="button-secondary px-3 py-1.5 text-xs"
            onClick={() => downloadReportPdf(report, assessmentId)}
          >
            <FileDown className="h-3.5 w-3.5" />
            PDF
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-xs ${view === "json" ? "button-primary" : "button-secondary"}`}
            onClick={() => setView(view === "json" ? "report" : "json")}
          >
            {view === "json" ? <FileText className="h-3.5 w-3.5" /> : <Braces className="h-3.5 w-3.5" />}
            {view === "json" ? "Report" : "JSON"}
          </button>
          <button type="button" className="button-primary px-3 py-1.5 text-xs">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {view === "report" ? (
          <ReportView report={report} />
        ) : (
          <pre className="whitespace-pre-wrap break-words rounded-xl border border-aegis-border bg-aegis-bg/60 p-4 font-mono text-[12px] leading-6 text-slate-300">
            {JSON.stringify(report, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
