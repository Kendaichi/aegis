import type { FrameAnalysis, Report } from "../lib/api";
import KeyFindingsFrameCards from "./reports/KeyFindingsFrameCards";

interface Props {
  report: Report | null;
  /** When set, Key Findings render with frame thumbnails (same order as backend top-by-severity). */
  frames?: FrameAnalysis[] | null;
}

const severityColor: Record<string, string> = {
  none: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-100",
  minor: "border border-amber-500/30 bg-amber-500/18 text-amber-100",
  moderate: "border border-orange-500/30 bg-orange-500/15 text-orange-100",
  severe: "border border-red-500/30 bg-red-500/15 text-red-100",
  destroyed: "border border-red-700/30 bg-red-700/20 text-red-100",
};

export default function ReportView({ report, frames = null }: Props) {
  if (!report) {
    return (
      <div className="text-[13px] text-aegis-muted">
        No report yet. Upload a video and run an analysis to generate one.
      </div>
    );
  }

  const frameList = frames ?? [];
  const showFrameCards = frameList.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${severityColor[report.overall_severity] ?? "border border-slate-500/30 bg-slate-500/15 text-slate-200"}`}
        >
          {report.overall_severity}
        </span>
        <span className="text-[12px] text-slate-500">
          {new Date(report.created_at).toLocaleString()}
        </span>
      </div>

      <p className="text-[14px] leading-7 text-slate-100">{report.summary}</p>

      <section>
        <h3 className="section-title">Key Findings</h3>
        {showFrameCards ? (
          <KeyFindingsFrameCards findings={report.key_findings} frames={frameList} />
        ) : (
          <ul className="mt-3 space-y-2 text-[13px] leading-6 text-slate-300">
            {report.key_findings.map((finding, index) => (
              <li
                key={index}
                className="rounded-2xl border border-aegis-border bg-aegis-surface2/70 px-4 py-3"
              >
                {finding}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="section-title">Recommendations</h3>
        <ul className="mt-3 space-y-2 text-[13px] leading-6 text-slate-300">
          {report.recommendations.map((recommendation, index) => (
            <li
              key={index}
              className="rounded-2xl border border-aegis-border bg-aegis-surface2/70 px-4 py-3"
            >
              {recommendation}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
