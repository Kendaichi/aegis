import type { FrameAnalysis } from "../../lib/api";
import { topKeyFrames } from "../../lib/assessments";
import FrameAnalysisImage from "../workspace/FrameAnalysisImage";

interface Props {
  findings: string[];
  frames: FrameAnalysis[];
}

export default function KeyFindingsFrameCards({ findings, frames }: Props) {
  const top = topKeyFrames(frames, 5);
  if (!top.length) return null;

  return (
    <ul className="mt-3 space-y-4">
      {top.map((frame, i) => (
        <li
          key={`${frame.frame_index}-${i}`}
          className="overflow-hidden rounded-2xl border border-aegis-border bg-aegis-surface px-3 py-3"
        >
          <FrameAnalysisImage frame={frame} className="mb-3" maxHeightClass="max-h-56" />
          <p className="text-[13px] leading-6 text-slate-300">
            {findings[i] ??
              `Frame @ ${frame.timestamp_seconds.toFixed(1)}s — ${frame.severity}: ${frame.description}`}
          </p>
        </li>
      ))}
    </ul>
  );
}
