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
          className="flex gap-3 overflow-hidden rounded-2xl border border-aegis-border bg-aegis-surface px-3 py-3"
        >
          <div className="w-[55%] shrink-0 self-start [&_.mx-auto]:mx-0">
            <FrameAnalysisImage
              frame={frame}
              className="!space-y-0"
              maxHeightClass="max-h-40"
            />
          </div>
          <p className="min-w-0 flex-1 self-center text-[13px] leading-6 text-slate-300">
            {findings[i] ??
              `Frame @ ${frame.timestamp_seconds.toFixed(1)}s — ${frame.severity}: ${frame.description}`}
          </p>
        </li>
      ))}
    </ul>
  );
}
