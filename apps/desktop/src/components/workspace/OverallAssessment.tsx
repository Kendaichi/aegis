import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { FrameAnalysis, Report } from "../../lib/api";
import DetailedInsights from "./DetailedInsights";

const severityColor: Record<string, string> = {
  none: "bg-emerald-500",
  minor: "bg-amber-500",
  moderate: "bg-orange-500",
  severe: "bg-red-500",
  destroyed: "bg-red-700",
};

function countBySeverity(frames: FrameAnalysis[]) {
  const counts = {
    none: 0,
    minor: 0,
    moderate: 0,
    severe: 0,
    destroyed: 0,
  };

  for (const frame of frames) {
    if (frame.severity in counts) counts[frame.severity as keyof typeof counts] += 1;
  }

  return counts;
}

interface Props {
  report: Report;
  frames: FrameAnalysis[];
  onSelectFrame?: (frame: FrameAnalysis) => void;
  className?: string;
}

export default function OverallAssessment({
  report,
  frames,
  onSelectFrame,
  className = "",
}: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const counts = countBySeverity(frames);
  const total = frames.length || 1;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="rounded-card border border-aegis-border bg-aegis-surface2/70 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
            {report.overall_severity}
          </span>
          <span className="text-[12px] text-slate-500">
            {new Date(report.created_at).toLocaleString()}
          </span>
        </div>
        <p className="mt-4 text-[14px] leading-7 text-slate-100">{report.summary}</p>
      </div>

      <section className="rounded-card border border-aegis-border bg-aegis-surface2/70 p-4">
        <h3 className="section-title">Severity Distribution</h3>
        <div className="mt-4 space-y-3">
          {(
            [
              ["destroyed", "Destroyed", counts.destroyed],
              ["severe", "Severe", counts.severe],
              ["moderate", "Moderate", counts.moderate],
              ["minor", "Minor", counts.minor],
              ["none", "None", counts.none],
            ] as const
          ).map(([key, label, count]) => (
            <div key={key} className="flex items-center gap-3 text-[12px]">
              <span className="w-20 text-slate-500">{label}</span>
              <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-aegis-surface">
                <div
                  className={severityColor[key] ?? "bg-slate-600"}
                  style={{ width: `${(count / total) * 100}%`, height: "100%" }}
                />
              </div>
              <span className="w-8 text-right text-slate-400">{count}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-500">
          Bars reflect the share of {frames.length} analyzed frames.
        </p>
      </section>

      <section className="rounded-card border border-aegis-border bg-aegis-surface2/70 p-4">
        <h3 className="section-title">Key Findings</h3>
        <ul className="mt-3 space-y-2 text-[13px] leading-6 text-slate-300">
          {report.key_findings.map((finding, index) => (
            <li
              key={index}
              className="rounded-2xl border border-aegis-border bg-aegis-surface px-3 py-3"
            >
              {finding}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-card border border-aegis-border bg-aegis-surface2/70 p-4">
        <h3 className="section-title">Recommendations</h3>
        <ul className="mt-3 space-y-2 text-[13px] leading-6 text-slate-300">
          {report.recommendations.map((recommendation, index) => (
            <li
              key={index}
              className="rounded-2xl border border-aegis-border bg-aegis-surface px-3 py-3"
            >
              {recommendation}
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={() => setShowDetails((value) => !value)}
        className="button-secondary w-full"
      >
        {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {showDetails ? "Hide" : "View"} Detailed Insights
      </button>

      {showDetails && (
        <DetailedInsights frames={frames} onSelectRow={onSelectFrame} className="max-h-72" />
      )}
    </div>
  );
}
