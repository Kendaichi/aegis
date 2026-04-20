import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandedLoaderInline } from "../ui/BrandedLoader";

interface Props {
  /** Local file from upload / workspace (takes precedence over `src`). */
  file?: File | null;
  /** Remote URL (e.g. signed storage URL from `VideoListItem.url`). */
  src?: string | null;
  liveMode?: boolean;
  /** When true, starts muted playback after metadata loads (browser autoplay policies). */
  autoPlay?: boolean;
  onTimeUpdate?: (seconds: number) => void;
  className?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({
  file = null,
  src = null,
  liveMode = false,
  autoPlay = false,
  onTimeUpdate,
  className = "",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  const remoteUrl = src?.trim() || null;
  const url = file ? blobUrl : remoteUrl;

  useEffect(() => {
    if (!file) {
      setBlobUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setBlobUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    const onLoaded = () => {
      setDuration(video.duration || 0);
      if (autoPlay) {
        video.muted = true;
        void video.play().catch(() => {
          /* autoplay may be blocked until user gesture */
        });
      }
    };
    const onTime = () => {
      const time = video.currentTime;
      setCurrent(time);
      onTimeUpdate?.(time);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [autoPlay, onTimeUpdate, url]);

  const hasSource = Boolean(file || remoteUrl);
  if (!hasSource) {
    return (
      <div
        className={`flex aspect-video w-full items-center justify-center rounded-card border border-dashed border-aegis-border bg-aegis-surface2/60 text-[13px] text-slate-500 ${className}`}
      >
        No video loaded
      </div>
    );
  }

  if (file && !blobUrl) {
    return (
      <div
        className={`flex aspect-video w-full items-center justify-center rounded-card border border-dashed border-aegis-border bg-aegis-surface2/60 ${className}`}
      >
        <BrandedLoaderInline message="Loading video…" />
      </div>
    );
  }

  if (!url) {
    return (
      <div
        className={`flex aspect-video w-full items-center justify-center rounded-card border border-dashed border-aegis-border bg-aegis-surface2/60 text-[13px] text-slate-500 ${className}`}
      >
        No video loaded
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative overflow-hidden rounded-card border border-aegis-border bg-black shadow-card">
        {liveMode && (
          <span className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Live
          </span>
        )}
        <video
          ref={videoRef}
          src={url}
          className="aspect-video w-full object-contain"
          playsInline
          muted={autoPlay}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            if (video.paused) void video.play();
            else video.pause();
          }}
          className="button-secondary px-3"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? "Pause" : "Play"}
        </button>
        <span className="w-28 text-[12px] text-slate-400">
          {formatTime(current)} / {formatTime(duration)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={current}
          onChange={(e) => {
            const video = videoRef.current;
            if (!video) return;
            video.currentTime = Number(e.target.value);
            setCurrent(video.currentTime);
          }}
          className="min-w-0 flex-1 accent-aegis-accent"
        />
      </div>
    </div>
  );
}
