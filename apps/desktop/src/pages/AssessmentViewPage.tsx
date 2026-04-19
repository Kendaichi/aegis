import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import MapView from "../components/Map";
import { SeverityBadge, StatusBadge } from "../components/ui/Badges";
import DetailedInsights from "../components/workspace/DetailedInsights";
import FrameImageModal from "../components/workspace/FrameImageModal";
import { severityToLevel } from "../lib/assessments";
import { api, type FrameAnalysis, type Report, type VideoListItem } from "../lib/api";
import type { AssessmentStatus, SeverityLevel } from "../lib/mockData";

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

function filenameToTitle(filename: string): string {
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  return withoutExt.replace(/[_-]+/g, " ").trim() || filename;
}

interface AssessmentHeader {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  date: string;
  severity: SeverityLevel;
  status: AssessmentStatus;
}

function buildHeader(video: VideoListItem, report: Report | null): AssessmentHeader {
  const location = report?.location
    ? `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`
    : "Location pending";
  return {
    id: video.video_id,
    title: filenameToTitle(video.filename),
    subtitle: video.content_type ?? "",
    location,
    date: new Date(video.created_at).toISOString().slice(0, 10),
    severity: severityToLevel(report?.overall_severity),
    status: report ? "complete" : "pending",
  };
}

export default function AssessmentViewPage({ assessmentId, onBack }: Props) {
  const [header, setHeader] = useState<AssessmentHeader | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [frames, setFrames] = useState<FrameAnalysis[]>([]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);
  const [modalFrame, setModalFrame] = useState<FrameAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inspectFrame = useCallback((frame: FrameAnalysis) => {
    setSelectedFrameIndex(frame.frame_index);
    setModalFrame(frame);
  }, []);

  const counts = useMemo(() => countBySeverity(frames), [frames]);
  const total = frames.length || 1;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [videosRes, reports, framesRes] = await Promise.all([
          api.listVideos(),
          api.listReports(assessmentId),
          api.getFrames(assessmentId).catch(() => ({ frames: [] as FrameAnalysis[] })),
        ]);
        if (cancelled) return;

        const video = videosRes.videos.find((v) => v.video_id === assessmentId);
        if (!video) {
          setError("Assessment not found.");
          return;
        }
        const latestReport = reports[0] ?? null;
        setReport(latestReport);
        setFrames(framesRes.frames);
        setHeader(buildHeader(video, latestReport));
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load assessment");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-slate-400">Loading assessment...</p>
      </div>
    );
  }

  if (error || !header) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-slate-400">{error ?? "Assessment not found."}</p>
        <button type="button" onClick={onBack} className="button-secondary">
          <ArrowLeft className="h-4 w-4" /> Back to Assessments
        </button>
      </div>
    );
  }

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
              <span className="font-mono text-[12px] text-aegis-accent">
                {header.id.slice(0, 10)}
              </span>
              <StatusBadge status={header.status} />
              <SeverityBadge level={header.severity} />
            </div>
            <h1 className="mt-1 text-lg font-semibold text-white">{header.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[12px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {header.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {header.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {header.subtitle}
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
                    onSelectRow={inspectFrame}
                    className="max-h-80"
                  />
                </section>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-500">
              <p className="text-[14px]">
                {header.status === "pending"
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

      <FrameImageModal frame={modalFrame} onClose={() => setModalFrame(null)} />
    </div>
  );
}
