import type { FrameAnalysis } from "../../lib/api";
import type { SeverityLevel } from "../../lib/mockData";
import { SeverityBadge } from "../ui/Badges";
import FrameAnalysisImage from "../workspace/FrameAnalysisImage";

function damageToSeverityLevel(
  severity: FrameAnalysis["severity"],
): SeverityLevel {
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

export default function FrameAnalysisCards({
  frames,
  selectedFrameIndex,
  onSelectFrame,
  className = "",
}: Props) {
  return (
    <div className={`flex min-h-0 flex-col overflow-hidden ${className}`}>
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
              className={`flex w-full gap-3 rounded-card border p-3 text-left shadow-card transition ${
                selected
                  ? "border-aegis-accent/40 bg-aegis-glow ring-1 ring-aegis-accent/30"
                  : "border-aegis-border bg-aegis-surface2/85 hover:bg-white/[0.03]"
              }`}
            >
              <div className="w-[55%] shrink-0 self-start [&_.mx-auto]:mx-0">
                <FrameAnalysisImage
                  frame={frame}
                  className="!space-y-0"
                  maxHeightClass="max-h-40"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-500">
                    #{frame.frame_index}
                  </span>
                  <SeverityBadge
                    level={damageToSeverityLevel(frame.severity)}
                  />
                  <span className="text-[11px] text-slate-500">
                    {frame.timestamp_seconds.toFixed(1)}s
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-6 text-slate-200">
                  {frame.description}
                </p>
                {frame.detected_hazards.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
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
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
