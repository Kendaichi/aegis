import { FileVideo, Sparkles } from "lucide-react";
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
  const [status, setStatus] = useState("");

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    setStatus("Uploading footage...");
    try {
      const res = await api.upload(file);
      onUploaded(res.video_id);
      setStatus(`Uploaded ${res.filename}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function generateReport() {
    if (!videoId) return;
    setBusy(true);
    setError(null);
    setStatus("Analyzing frames...");
    try {
      const report = await api.report(videoId);
      onReport(report);
      setStatus("Report generated.");
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-aegis-border bg-aegis-glow text-aegis-accent">
          <FileVideo className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-white">Video Upload</h2>
          <p className="mt-1 text-[13px] text-slate-400">
            Upload source footage and generate an AI-assisted report.
          </p>
        </div>
      </div>

      <label className="mt-4 block">
        <span className="sr-only">Choose video</span>
        <input
          type="file"
          accept="video/*"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
          className="block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-aegis-accent file:px-4 file:py-2 file:font-medium file:text-white hover:file:brightness-110"
        />
      </label>

      {videoId && (
        <div className="mt-4 rounded-2xl border border-aegis-border bg-aegis-surface2 px-3 py-2 text-[12px] text-slate-400">
          video_id: <span className="font-mono text-slate-200">{videoId}</span>
        </div>
      )}

      <button
        type="button"
        disabled={!videoId || busy}
        onClick={generateReport}
        className="button-primary mt-4 w-full"
      >
        <Sparkles className="h-4 w-4" />
        Analyze and generate report
      </button>

      {status && <p className="mt-3 text-[12px] text-aegis-muted">{status}</p>}
      {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
    </div>
  );
}
