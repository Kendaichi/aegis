import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { frameImageUrl, type FrameAnalysis } from "../../lib/api";
import { severityToLevel } from "../../lib/assessments";
import { SeverityBadge } from "../ui/Badges";
import { BrandedLoaderInline } from "../ui/BrandedLoader";
import { frameBorderBySeverity } from "./FrameAnalysisImage";

interface Props {
  frame: FrameAnalysis | null;
  videoFile?: File | null;
  onClose: () => void;
}

export default function FrameImageModal({ frame, videoFile, onClose }: Props) {
  const [captureUrl, setCaptureUrl] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState(false);
  const [remoteImageError, setRemoteImageError] = useState(false);
  const [imgNaturalSize, setImgNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);

  const clearCapture = useCallback(() => {
    setCaptureUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setCaptureError(false);
    setImgNaturalSize(null);
  }, []);

  // Reset remote image error whenever the frame changes
  useEffect(() => {
    setRemoteImageError(false);
  }, [frame]);

  useEffect(() => {
    if (!frame) {
      clearCapture();
      return;
    }

    // Use remote image if available and not yet failed
    if (frame.image_url && !remoteImageError) {
      clearCapture();
      return;
    }

    if (!videoFile) {
      clearCapture();
      setCaptureError(true);
      return;
    }

    setCaptureError(false);
    const objUrl = URL.createObjectURL(videoFile);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = objUrl;

    let cancelled = false;

    const cleanupVideo = () => {
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(objUrl);
    };

    const onSeeked = () => {
      if (cancelled) return;
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) {
        setCaptureError(true);
        cleanupVideo();
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setCaptureError(true);
        cleanupVideo();
        return;
      }
      ctx.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (cancelled || !blob) {
            setCaptureError(true);
            cleanupVideo();
            return;
          }
          const u = URL.createObjectURL(blob);
          setCaptureUrl((prev) => {
            if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
            return u;
          });
          setImgNaturalSize({ w, h });
          cleanupVideo();
        },
        "image/jpeg",
        0.92,
      );
      video.removeEventListener("seeked", onSeeked);
    };

    const onLoadedMeta = () => {
      if (cancelled) return;
      const dur = video.duration;
      const t =
        Number.isFinite(dur) && dur > 0
          ? Math.min(frame.timestamp_seconds, Math.max(0, dur - 0.05))
          : frame.timestamp_seconds;
      video.currentTime = t;
    };

    video.addEventListener("loadedmetadata", onLoadedMeta);
    video.addEventListener("seeked", onSeeked);
    void video.load();

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", onLoadedMeta);
      video.removeEventListener("seeked", onSeeked);
      cleanupVideo();
      clearCapture();
    };
  }, [frame, videoFile, clearCapture, remoteImageError]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!frame) return null;

  const hasRemoteImage = Boolean(frame.image_url) && !remoteImageError;
  const displaySrc = hasRemoteImage
    ? frameImageUrl(frame.image_url!)
    : captureUrl;

  const detections = frame.detections ?? [];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="frame-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-aegis-border bg-aegis-surface shadow-2xl lg:flex-row">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-lg border border-aegis-border bg-aegis-surface2/95 text-slate-200 shadow-lg backdrop-blur-sm transition hover:bg-aegis-surface hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-black/40 p-3 pt-14 lg:pt-3">
          {!displaySrc && !captureError && (
            <div className="flex min-h-0 flex-1 items-center justify-center px-4">
              <BrandedLoaderInline message="Loading frame…" className="text-slate-400" />
            </div>
          )}
          {captureError && !displaySrc && (
            <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center text-sm text-slate-400">
              Could not load this frame. Use backend analysis with stored frame
              JPEGs, or ensure a local video is available.
            </div>
          )}

          {displaySrc && (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto">
              <div className="relative mx-auto inline-block max-w-full">
                <img
                  src={displaySrc}
                  alt={`Frame ${frame.frame_index}`}
                  className="max-h-[min(calc(90vh-8rem),720px)] w-auto max-w-full object-contain"
                  onLoad={(e) => {
                    const el = e.currentTarget;
                    setImgNaturalSize({
                      w: el.naturalWidth,
                      h: el.naturalHeight,
                    });
                  }}
                  onError={() => setRemoteImageError(true)}
                />
                <div className="pointer-events-none absolute inset-0">
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
              </div>
              {imgNaturalSize && (
                <p className="mt-2 shrink-0 text-center text-[10px] text-slate-500">
                  {imgNaturalSize.w}×{imgNaturalSize.h}px · t=
                  {frame.timestamp_seconds.toFixed(1)}s
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex w-full max-w-md shrink-0 flex-col gap-4 border-t border-aegis-border bg-aegis-surface2/90 p-5 pr-14 lg:border-l lg:border-t-0">
          <div>
            <h2
              id="frame-modal-title"
              className="text-sm font-semibold text-white"
            >
              Frame #{frame.frame_index}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <SeverityBadge level={severityToLevel(frame.severity)} />
              <span className="text-[11px] text-slate-500">
                {(frame.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
          </div>
          <p className="text-[13px] leading-6 text-slate-200">
            {frame.description}
          </p>
          {frame.detected_hazards.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Hazards
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {frame.detected_hazards.map((h) => (
                  <li
                    key={h}
                    className="rounded-full border border-aegis-border bg-aegis-surface px-2.5 py-1 text-[11px] text-slate-400"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {detections.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Localized regions ({detections.length})
              </p>
              <ul className="mt-2 space-y-2 text-[12px] text-slate-300">
                {detections.map((d, i) => (
                  <li
                    key={i}
                    className="flex justify-between gap-2 border-t border-aegis-border/60 pt-2 first:border-t-0 first:pt-0"
                  >
                    <span>{d.label}</span>
                    <span className="text-slate-500">
                      {d.severity} · {(d.confidence * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
