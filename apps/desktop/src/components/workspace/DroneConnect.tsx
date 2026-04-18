import { Radio, Router } from "lucide-react";
import { useState } from "react";

type Status = "disconnected" | "connecting" | "connected";

interface Props {
  onFallbackToUpload?: () => void;
  /** When true, the "Use a recorded video" action is disabled (e.g. metadata not filled). */
  uploadDisabled?: boolean;
  className?: string;
}

export default function DroneConnect({
  onFallbackToUpload,
  uploadDisabled = false,
  className = "",
}: Props) {
  const [rtspUrl, setRtspUrl] = useState("rtsp://drone.local:554/stream");
  const [status, setStatus] = useState<Status>("disconnected");

  function handleConnect() {
    if (status === "connecting") return;
    setStatus("connecting");
    window.setTimeout(() => {
      setStatus("connected");
    }, 1400);
  }

  return (
    <div className={`card p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-aegis-border bg-aegis-glow text-aegis-accent">
          <Radio className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-white">Drone feed</h3>
          <p className="mt-1 text-[13px] leading-6 text-slate-400">
            Live RTSP or WebRTC ingestion is coming soon. Use a recorded video to simulate the
            live analysis pipeline for now.
          </p>
        </div>
      </div>

      <label className="mt-4 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
        RTSP URL
      </label>
      <div className="relative mt-2">
        <Router className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={rtspUrl}
          onChange={(e) => setRtspUrl(e.target.value)}
          className="input-shell pl-10"
          placeholder="rtsp://..."
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleConnect}
          disabled={status === "connecting"}
          className="button-secondary"
        >
          {status === "connecting" ? "Connecting..." : "Connect"}
        </button>
        <span
          className={`text-[12px] font-medium ${
            status === "connected"
              ? "text-emerald-400"
              : status === "connecting"
                ? "text-amber-400"
                : "text-slate-500"
          }`}
        >
          {status === "connected"
            ? "Connected (demo)"
            : status === "connecting"
              ? "Connecting..."
              : "Disconnected"}
        </span>
      </div>

      {status === "connecting" && (
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-aegis-surface2">
          <div className="h-full w-1/2 animate-[shimmer_1s_ease-in-out_infinite] bg-aegis-accent/70" />
        </div>
      )}

      {status === "connected" && (
        <p className="mt-4 text-[12px] leading-6 text-amber-300/90">
          Demo mode only.{" "}
          <button
            type="button"
            disabled={uploadDisabled}
            title={
              uploadDisabled
                ? "Fill in title, location, and incident type in the Video file card first."
                : undefined
            }
            className="font-medium text-aegis-accent underline underline-offset-4 transition hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
            onClick={() => onFallbackToUpload?.()}
          >
            Use a recorded video
          </button>{" "}
          to simulate analysis.
        </p>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
