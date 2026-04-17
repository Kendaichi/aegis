import { ArrowLeft, RotateCcw, ShieldCheck, Video } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import MapView from "../components/Map";
import Chat from "../components/Chat";
import { api, type FrameAnalysis, type Report, type UploadMetadata } from "../lib/api";
import { AlertProvider, useAlert } from "../components/workspace/AlertToast";
import VideoPlayer from "../components/workspace/VideoPlayer";
import FrameAnalysisFeed from "../components/workspace/FrameAnalysisFeed";
import DroneConnect from "../components/workspace/DroneConnect";
import OverallAssessment from "../components/workspace/OverallAssessment";

interface Props {
  onBack: () => void;
}

type Phase = "idle" | "uploading" | "streaming" | "analyzing" | "complete";

function phaseLabel(phase: Phase): string {
  switch (phase) {
    case "idle":
      return "Ready";
    case "uploading":
      return "Uploading";
    case "streaming":
      return "Live Preview";
    case "analyzing":
      return "Analyzing";
    case "complete":
      return "Complete";
    default:
      return phase;
  }
}

function phasePillClass(phase: Phase): string {
  switch (phase) {
    case "complete":
      return "border border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
    case "analyzing":
      return "border border-amber-500/25 bg-amber-500/10 text-amber-200";
    case "streaming":
      return "border border-aegis-accent/25 bg-aegis-glow text-blue-100";
    case "uploading":
      return "border border-slate-500/25 bg-slate-500/10 text-slate-300";
    case "idle":
    default:
      return "border border-slate-500/25 bg-slate-500/10 text-slate-300";
  }
}

interface WorkspaceMainProps {
  onBack: () => void;
  selectedFrameIndex: number | null;
  onSelectFrame: (index: number | null) => void;
}

function WorkspaceMain({ onBack, selectedFrameIndex, onSelectFrame }: WorkspaceMainProps) {
  const { showAlert } = useAlert();
  const [phase, setPhase] = useState<Phase>("idle");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [frames, setFrames] = useState<FrameAnalysis[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leftView, setLeftView] = useState<"video" | "assessment">("assessment");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaLocation, setMetaLocation] = useState("");
  const [metaIncidentType, setMetaIncidentType] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const frameForChat = useMemo(() => {
    if (selectedFrameIndex == null) return null;
    return frames.find((frame) => frame.frame_index === selectedFrameIndex) ?? null;
  }, [frames, selectedFrameIndex]);

  const resetSession = useCallback(() => {
    setPhase("idle");
    setVideoFile(null);
    setVideoId(null);
    setFrames([]);
    setReport(null);
    setError(null);
    onSelectFrame(null);
    setLeftView("assessment");
    setMetaTitle("");
    setMetaLocation("");
    setMetaIncidentType("");
  }, [onSelectFrame]);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    setPhase("uploading");
    try {
      const metadata: UploadMetadata = {};
      if (metaTitle.trim()) metadata.title = metaTitle.trim();
      if (metaLocation.trim()) metadata.location_name = metaLocation.trim();
      if (metaIncidentType.trim()) metadata.incident_type = metaIncidentType.trim();
      const res = await api.upload(file, metadata);
      setVideoFile(file);
      setVideoId(res.video_id);
      setFrames([]);
      setReport(null);
      setPhase("streaming");
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      setPhase("idle");
    } finally {
      setBusy(false);
    }
  }

  async function runAnalysis() {
    if (!videoId) return;
    setBusy(true);
    setError(null);
    setPhase("analyzing");
    setFrames([]);
    try {
      await api.analyzeStream(videoId, (frame) => {
        setFrames((prev) => [...prev, frame]);
        if (frame.severity === "severe" || frame.severity === "destroyed") {
          showAlert({
            frameIndex: frame.frame_index,
            severity: frame.severity,
            description: frame.description,
            frame,
          });
        }
      });
      const nextReport = await api.report(videoId);
      setReport(nextReport);
      setPhase("complete");
      setLeftView("assessment");
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      setPhase("streaming");
    } finally {
      setBusy(false);
    }
  }

  const showMapFrames = phase === "analyzing" || phase === "complete";
  const mapFrames = showMapFrames ? frames : undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-aegis-border bg-aegis-surface2/85 px-5 py-3 backdrop-blur-xl">
        <button type="button" onClick={onBack} className="button-ghost px-0">
          <ArrowLeft className="h-4 w-4" />
          Back to App
        </button>
        <div className="hidden h-5 w-px bg-aegis-border sm:block" />
        <div className="min-w-0">
          <p className="section-title">Workspace Session</p>
          <p className="mt-1 truncate text-[12px] text-slate-400">
            {videoId ? (
              <>
                Active session: <span className="font-mono text-slate-200">{videoId}</span>
              </>
            ) : (
              "Upload a video or connect to a demo drone feed to begin."
            )}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${phasePillClass(phase)}`}
          >
            {phaseLabel(phase)}
          </span>
          {(phase === "streaming" || phase === "complete" || phase === "analyzing") && (
            <button type="button" onClick={resetSession} className="button-secondary px-3 py-2 text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
              New Session
            </button>
          )}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 xl:grid-cols-12">
        <aside className="flex min-h-0 flex-col gap-4 overflow-auto xl:col-span-3">
          {phase === "idle" && (
            <>
              <DroneConnect
                onFallbackToUpload={() => {
                  document.getElementById("workspace-video-file")?.click();
                }}
              />
              <div className="card p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-aegis-border bg-aegis-glow text-aegis-accent">
                    <Video className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Video file</h3>
                    <p className="mt-1 text-[13px] text-slate-400">
                      Add assessment details, then upload recorded footage to start the run.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                      Title
                    </span>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="Butuan City Flooding"
                      disabled={busy}
                      className="input-shell mt-1.5"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                      Location
                    </span>
                    <input
                      type="text"
                      value={metaLocation}
                      onChange={(e) => setMetaLocation(e.target.value)}
                      placeholder="Butuan City, Agusan del Norte"
                      disabled={busy}
                      className="input-shell mt-1.5"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                      Incident type
                    </span>
                    <select
                      value={metaIncidentType}
                      onChange={(e) => setMetaIncidentType(e.target.value)}
                      disabled={busy}
                      className="input-shell mt-1.5"
                    >
                      <option value="">Select incident type...</option>
                      <option value="Flooding">Flooding</option>
                      <option value="Landslide">Landslide</option>
                      <option value="Typhoon Damage">Typhoon Damage</option>
                      <option value="Earthquake">Earthquake</option>
                      <option value="Fire">Fire</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                </div>

                <input
                  ref={fileInputRef}
                  id="workspace-video-file"
                  type="file"
                  accept="video/*"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileInputRef.current?.click()}
                  className="button-primary mt-4 w-full"
                >
                  <Video className="h-4 w-4" />
                  Choose video and upload
                </button>
              </div>
            </>
          )}

          {(phase === "uploading" || phase === "streaming") && (
            <div className="card p-4">
              <VideoPlayer file={videoFile} liveMode={phase === "streaming"} className="shrink-0" />
              {phase === "streaming" && (
                <button
                  type="button"
                  disabled={busy || !videoId}
                  onClick={() => void runAnalysis()}
                  className="button-primary mt-4 w-full"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Start Live Analysis
                </button>
              )}
            </div>
          )}

          {phase === "analyzing" && (
            <div className="card p-4">
              <VideoPlayer file={videoFile} liveMode className="shrink-0" />
              <p className="mt-4 text-[12px] leading-6 text-slate-400">
                Frames stream in as analysis runs. Severe and critical detections trigger priority
                alerts and map focus.
              </p>
            </div>
          )}

          {phase === "complete" && report && (
            <>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLeftView("video")}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition ${
                    leftView === "video"
                      ? "bg-aegis-accent text-white shadow-glow"
                      : "border border-aegis-border bg-aegis-surface2 text-slate-300 hover:bg-white/5"
                  }`}
                >
                  Video
                </button>
                <button
                  type="button"
                  onClick={() => setLeftView("assessment")}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition ${
                    leftView === "assessment"
                      ? "bg-aegis-accent text-white shadow-glow"
                      : "border border-aegis-border bg-aegis-surface2 text-slate-300 hover:bg-white/5"
                  }`}
                >
                  Assessment
                </button>
              </div>
              {leftView === "video" && (
                <div className="card p-4">
                  <VideoPlayer file={videoFile} liveMode={false} className="shrink-0" />
                </div>
              )}
              {leftView === "assessment" && (
                <OverallAssessment
                  report={report}
                  frames={frames}
                  onSelectFrame={(index) => onSelectFrame(index)}
                  className="min-h-0 flex-1 overflow-auto"
                />
              )}
            </>
          )}

          {error && <p className="text-[12px] text-red-400">{error}</p>}
        </aside>

        <section className="card flex min-h-[320px] flex-col overflow-hidden xl:col-span-6">
          <div className="card-header">
            <div>
              <p className="card-header-title">Operational Map</p>
              <h2 className="mt-1 text-base font-semibold text-white">Live spatial context</h2>
            </div>
          </div>
          <div className="min-h-0 flex-1 p-3">
            <div className="h-full overflow-hidden rounded-[1.25rem] border border-aegis-border bg-aegis-surface2">
              <MapView
                report={phase === "complete" ? report : null}
                analysisFrames={mapFrames}
                selectedFrameIndex={selectedFrameIndex}
              />
            </div>
          </div>
        </section>

        <aside className="card flex min-h-0 flex-col overflow-hidden p-4 xl:col-span-3">
          <FrameAnalysisFeed
            frames={frames}
            selectedFrameIndex={selectedFrameIndex}
            onSelectFrame={(index) => onSelectFrame(index)}
            className="min-h-0 flex-1"
          />
          {phase !== "complete" && (
            <p className="mt-4 text-[12px] leading-6 text-slate-500">
              Upload a video and start analysis to populate the live frame feed.
            </p>
          )}
          {phase === "complete" && report && (
            <p className="mt-4 text-[12px] leading-6 text-slate-500">
              The rollup is available on the left under <span className="text-slate-300">Assessment</span>.
              Select a frame to discuss it in chat.
            </p>
          )}
          <div className="mt-4 min-h-[220px] border-t border-aegis-border pt-4">
            <Chat
              reportId={report?.report_id}
              videoId={videoId ?? undefined}
              frameContext={frameForChat}
              onClearFrameContext={() => onSelectFrame(null)}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function AssessmentsWorkspacePage({ onBack }: Props) {
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);

  return (
    <AlertProvider onJumpToFrame={(frame) => setSelectedFrameIndex(frame.frame_index)}>
      <WorkspaceMain
        onBack={onBack}
        selectedFrameIndex={selectedFrameIndex}
        onSelectFrame={setSelectedFrameIndex}
      />
    </AlertProvider>
  );
}
