import { useState } from "react";
import { api, Report } from "../lib/api";

interface Props {
  videoId: string | null;
  onUploaded: (videoId: string) => void;
  onReport: (report: Report) => void;
}

export default function VideoUpload({ videoId, onUploaded, onReport }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    setStatus("Uploading...");
    try {
      const res = await api.upload(file);
      onUploaded(res.video_id);
      setStatus(`Uploaded ${res.filename}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function generateReport() {
    if (!videoId) return;
    setBusy(true);
    setError(null);
    setStatus("Analyzing frames with Gemma 3...");
    try {
      const report = await api.report(videoId);
      onReport(report);
      setStatus("Report generated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-aegis-muted">
        Video
      </h2>

      <label className="block">
        <span className="sr-only">Choose video</span>
        <input
          type="file"
          accept="video/*"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-aegis-accent file:px-3 file:py-1.5 file:text-white hover:file:opacity-90"
        />
      </label>

      {videoId && (
        <div className="text-xs text-aegis-muted break-all">
          video_id: <span className="text-slate-200">{videoId}</span>
        </div>
      )}

      <button
        disabled={!videoId || busy}
        onClick={generateReport}
        className="rounded-md bg-aegis-accent/90 px-3 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-aegis-accent"
      >
        Analyze & generate report
      </button>

      {status && <p className="text-xs text-aegis-muted">{status}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
