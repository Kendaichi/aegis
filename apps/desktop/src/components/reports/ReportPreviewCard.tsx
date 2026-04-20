import { Braces, FileDown, FileText, Loader2, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, type FrameAnalysis, type Report } from "../../lib/api";
import { buildReportExportPayload, downloadReportJson, downloadReportPdf } from "../../lib/exportReport";
import ReportView from "../Report";
import AegisLogo from "../ui/AegisLogo";

type ViewMode = "report" | "json";

interface Props {
  report: Report | null;
  assessmentId?: string;
}

export default function ReportPreviewCard({ report, assessmentId }: Props) {
  const [view, setView] = useState<ViewMode>("report");
  const [frames, setFrames] = useState<FrameAnalysis[] | null>(null);
  const [framesLoading, setFramesLoading] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  useEffect(() => {
    if (!report || !assessmentId) {
      setFrames(null);
      return;
    }
    let cancelled = false;
    setFramesLoading(true);
    void api
      .getFrames(assessmentId)
      .then((data) => {
        if (!cancelled) setFrames(data.frames?.length ? data.frames : null);
      })
      .catch(() => {
        if (!cancelled) setFrames(null);
      })
      .finally(() => {
        if (!cancelled) setFramesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [report?.video_id, assessmentId]);

  const jsonPayload = useMemo(
    () => (report ? buildReportExportPayload(report, frames) : null),
    [report, frames]
  );

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
            disabled={pdfBusy}
            onClick={() => {
              setPdfBusy(true);
              void downloadReportPdf(report, assessmentId, frames).finally(() => setPdfBusy(false));
            }}
          >
            {pdfBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileDown className="h-3.5 w-3.5" />
            )}
            PDF
          </button>
          <button
            type="button"
            className="button-secondary px-3 py-1.5 text-xs"
            onClick={() => downloadReportJson(report, assessmentId, frames)}
          >
            <FileDown className="h-3.5 w-3.5" />
            JSON
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
        {framesLoading && (
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <AegisLogo className="h-4 w-4 object-contain opacity-90" alt="" />
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading frame data…
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {view === "report" ? (
          <ReportView report={report} frames={frames} />
        ) : (
          <pre className="whitespace-pre-wrap break-words rounded-xl border border-aegis-border bg-aegis-bg/60 p-4 font-mono text-[12px] leading-6 text-slate-300">
            {jsonPayload ? JSON.stringify(jsonPayload, null, 2) : ""}
          </pre>
        )}
      </div>
    </div>
  );
}
