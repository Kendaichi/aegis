import { Braces, FileDown, Share2 } from "lucide-react";
import type { Report } from "../../lib/api";
import ReportView from "../Report";

interface Props {
  report: Report | null;
}

export default function ReportPreviewCard({ report }: Props) {
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
          <button type="button" className="button-secondary px-3 py-1.5 text-xs">
            <FileDown className="h-3.5 w-3.5" />
            PDF
          </button>
          <button type="button" className="button-secondary px-3 py-1.5 text-xs">
            <Braces className="h-3.5 w-3.5" />
            JSON
          </button>
          <button type="button" className="button-primary px-3 py-1.5 text-xs">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
          Mock actions
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <ReportView report={report} />
      </div>
    </div>
  );
}
