import { useState } from "react";
import { frameImageUrl, type DamageSeverity, type FrameAnalysis } from "../../lib/api";

export const frameBorderBySeverity: Record<DamageSeverity, string> = {
  none: "border-emerald-400 shadow-emerald-500/20",
  minor: "border-amber-400 shadow-amber-500/20",
  moderate: "border-orange-400 shadow-orange-500/20",
  severe: "border-red-400 shadow-red-500/30",
  destroyed: "border-red-600 shadow-red-600/40",
};

interface Props {
  frame: FrameAnalysis;
  className?: string;
  /** Tailwind max-height class for the image (e.g. max-h-48). */
  maxHeightClass?: string;
  caption?: string;
}

export default function FrameAnalysisImage({
  frame,
  className = "",
  maxHeightClass = "max-h-64",
  caption,
}: Props) {
  const [remoteError, setRemoteError] = useState(false);
  const detections = frame.detections ?? [];
  const src = frame.image_url ? frameImageUrl(frame.image_url) : "";

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative mx-auto inline-block max-w-full">
        {!src || remoteError ? (
          <div
            className={`flex aspect-video w-full min-h-[120px] max-w-md items-center justify-center rounded-xl border border-dashed border-aegis-border bg-aegis-surface2/60 px-4 text-center text-[12px] text-slate-500 ${maxHeightClass}`}
          >
            {!src ? "No frame image URL" : "Could not load frame image"}
          </div>
        ) : (
          <>
            <img
              src={src}
              alt={`Frame ${frame.frame_index} @ ${frame.timestamp_seconds}s`}
              className={`w-auto max-w-full rounded-xl border border-aegis-border object-contain ${maxHeightClass}`}
              onError={() => setRemoteError(true)}
            />
            <div className="pointer-events-none absolute inset-0 rounded-xl">
              {detections.map((d, i) => {
                const [x1, y1, x2, y2] = d.bbox;
                const left = x1 * 100;
                const top = y1 * 100;
                const width = (x2 - x1) * 100;
                const height = (y2 - y1) * 100;
                return (
                  <div
                    key={`${d.label}-${i}`}
                    className={`absolute border-2 shadow-lg ${frameBorderBySeverity[d.severity]}`}
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                    }}
                  >
                    <span className="pointer-events-none absolute -top-6 left-0 max-w-[200px] truncate rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {d.label} · {(d.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      {caption ? <p className="text-[11px] leading-5 text-slate-400">{caption}</p> : null}
    </div>
  );
}
