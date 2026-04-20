import { useEffect, useRef } from "react";
import type { FrameAnalysis } from "../../lib/api";
import type { SeverityLevel } from "../../lib/mockData";
import { SeverityBadge } from "../ui/Badges";

function damageToSeverityLevel(severity: FrameAnalysis["severity"]): SeverityLevel {
  switch (severity) {
    case "destroyed":
      return 5;
    case "severe":
      return 4;
    case "moderate":
      return 3;
    case "minor":
    case "none":
    default:
      return 2;
  }
}

interface Props {
  frames: FrameAnalysis[];
  selectedFrameIndex: number | null;
  onSelectFrame: (frame: FrameAnalysis) => void;
  className?: string;
}

export default function FrameAnalysisFeed({
  frames,
  selectedFrameIndex,
  onSelectFrame,
  className = "",
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (frames.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [frames.length]);

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="section-title">Frame Analysis</h3>
        <span className="rounded-full border border-aegis-border bg-aegis-surface2 px-2.5 py-1 text-[11px] text-slate-400">
          {frames.length} frame{frames.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {frames.length === 0 && (
          <div className="rounded-card border border-dashed border-aegis-border bg-aegis-surface2/50 p-4 text-[13px] text-slate-500">
            Waiting for analysis frames...
          </div>
        )}
        {frames.map((frame) => {
          const selected = selectedFrameIndex === frame.frame_index;
          return (
            <button
              key={frame.frame_index}
              type="button"
              onClick={() => onSelectFrame(frame)}
              className={`w-full rounded-card border p-3 text-left shadow-card transition ${
                selected
                  ? "border-aegis-accent/40 bg-aegis-glow ring-1 ring-aegis-accent/30"
                  : "border-aegis-border bg-aegis-surface2/85 hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-slate-500">#{frame.frame_index}</span>
                <SeverityBadge level={damageToSeverityLevel(frame.severity)} />
                <span className="text-[11px] text-slate-500">
                  {frame.timestamp_seconds.toFixed(1)}s
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-6 text-slate-200">{frame.description}</p>
              {frame.detected_hazards.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {frame.detected_hazards.map((hazard) => (
                    <span
                      key={hazard}
                      className="rounded-full border border-aegis-border bg-aegis-surface px-2.5 py-1 text-[11px] text-slate-400"
                    >
                      {hazard}
                    </span>
                  ))}
                </div>
              )}
              {(frame.access_route_status && frame.access_route_status !== "unknown") && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${frame.access_route_status === "blocked" ? "bg-red-500" : "bg-green-500"}`} />
                  <span className="text-[11px] text-slate-400">
                    Route {frame.access_route_status}
                  </span>
                </div>
              )}
              {(frame.resource_recommendations?.length ?? 0) > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {frame.resource_recommendations!.map((r) => (
                    <span
                      key={r}
                      className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-300"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
