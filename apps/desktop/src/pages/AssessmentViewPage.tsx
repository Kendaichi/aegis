import { ArrowLeft, MapPin, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import MapView from "../components/Map";
import { SeverityBadge, StatusBadge } from "../components/ui/Badges";
import DetailedInsights from "../components/workspace/DetailedInsights";
import type { FrameAnalysis } from "../lib/api";
import {
  MOCK_ASSESSMENTS,
  MOCK_FRAMES_BY_ASSESSMENT_ID,
  MOCK_REPORT_BY_ASSESSMENT_ID,
} from "../lib/mockData";

interface Props {
  assessmentId: string;
  onBack: () => void;
}

const severityColor: Record<string, string> = {
  none: "bg-emerald-500",
  minor: "bg-amber-500",
  moderate: "bg-orange-500",
  severe: "bg-red-500",
  destroyed: "bg-red-700",
};

function countBySeverity(frames: FrameAnalysis[]) {
  const counts = { none: 0, minor: 0, moderate: 0, severe: 0, destroyed: 0 };
  for (const f of frames) {
    if (f.severity in counts) counts[f.severity as keyof typeof counts] += 1;
  }
  return counts;
}

export default function AssessmentViewPage({ assessmentId, onBack }: Props) {
  const assessment = MOCK_ASSESSMENTS.find((a) => a.id === assessmentId);
  const report = MOCK_REPORT_BY_ASSESSMENT_ID[assessmentId];
  const frames = MOCK_FRAMES_BY_ASSESSMENT_ID[assessmentId] ?? [];
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);

  if (!assessment) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-slate-400">Assessment not found.</p>
        <button type="button" onClick={onBack} className="button-secondary">
          <ArrowLeft className="h-4 w-4" /> Back to Assessments
        </button>
      </div>
    );
  }

  const counts = countBySeverity(frames);
  const total = frames.length || 1;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-aegis-border bg-aegis-surface/60 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-aegis-border bg-aegis-surface2 text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[12px] text-aegis-accent">{assessment.id}</span>
              <StatusBadge status={assessment.status} />
              <SeverityBadge level={assessment.severity} />
            </div>
            <h1 className="mt-1 text-lg font-semibold text-white">{assessment.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[12px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {assessment.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {assessment.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {assessment.subtitle}
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_1fr] gap-0 overflow-hidden">
        {/* Left: Report + Insights */}
        <div className="flex min-h-0 flex-col overflow-y-auto border-r border-aegis-border p-5">
          {report ? (
            <div className="space-y-4">
              {/* Summary */}
              <section className="rounded-card border border-aegis-border bg-aegis-surface2/70 p-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                    {report.overall_severity}
                  </span>
                  <span className="text-[12px] text-slate-500">
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-4 text-[14px] leading-7 text-slate-100">{report.summary}</p>
              </section>

              {/* Severity Distribution */}
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

              {/* Key Findings */}
              <section className="rounded-card border border-aegis-border bg-aegis-surface2/70 p-4">
                <h3 className="section-title">Key Findings</h3>
                <ul className="mt-3 space-y-2 text-[13px] leading-6 text-slate-300">
                  {report.key_findings.map((finding, i) => (
                    <li
                      key={i}
                      className="rounded-2xl border border-aegis-border bg-aegis-surface px-3 py-3"
                    >
                      {finding}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Recommendations */}
              <section className="rounded-card border border-aegis-border bg-aegis-surface2/70 p-4">
                <h3 className="section-title">Recommendations</h3>
                <ul className="mt-3 space-y-2 text-[13px] leading-6 text-slate-300">
                  {report.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="rounded-2xl border border-aegis-border bg-aegis-surface px-3 py-3"
                    >
                      {rec}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Frame Analysis Table */}
              {frames.length > 0 && (
                <section>
                  <h3 className="section-title mb-3">Frame Analysis</h3>
                  <DetailedInsights
                    frames={frames}
                    onSelectRow={setSelectedFrameIndex}
                    className="max-h-80"
                  />
                </section>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-500">
              <p className="text-[14px]">
                {assessment.status === "pending"
                  ? "This assessment is pending — no analysis data yet."
                  : "Analysis is in progress..."}
              </p>
            </div>
          )}
        </div>

        {/* Right: Map */}
        <div className="relative min-h-0">
          <MapView
            report={report}
            analysisFrames={frames}
            selectedFrameIndex={selectedFrameIndex}
          />
        </div>
      </div>
    </div>
  );
}
