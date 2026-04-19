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
import FrameImageModal from "../components/workspace/FrameImageModal";
import ProgressBar from "../components/workspace/ProgressBar";
import LocationAutocomplete from "../components/workspace/LocationAutocomplete";

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

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
  inspectFrame: (frame: FrameAnalysis) => void;
  modalFrame: FrameAnalysis | null;
  onCloseModal: () => void;
  onClearFrameContext: () => void;
}

function WorkspaceMain({
  onBack,
  selectedFrameIndex,
  onSelectFrame,
  inspectFrame,
  modalFrame,
  onCloseModal,
  onClearFrameContext,
}: WorkspaceMainProps) {
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
  const [metaCoords, setMetaCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [metaIncidentType, setMetaIncidentType] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadProcessing, setUploadProcessing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeFrameTotal, setAnalyzeFrameTotal] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const frameForChat = useMemo(() => {
    if (selectedFrameIndex == null) return null;
    return frames.find((frame) => frame.frame_index === selectedFrameIndex) ?? null;
  }, [frames, selectedFrameIndex]);

  const metadataReady = useMemo(
    () =>
      metaTitle.trim().length > 0 &&
      metaLocation.trim().length > 0 &&
      metaIncidentType.trim().length > 0 &&
      metaCoords != null,
    [metaTitle, metaLocation, metaIncidentType, metaCoords]
  );

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
    setMetaCoords(null);
    setMetaIncidentType("");
    setUploadProgress(0);
    setUploadProcessing(false);
    setAnalyzeProgress(0);
    setAnalyzeFrameTotal(0);
  }, [onSelectFrame]);

  async function handleFile(file: File) {
    if (!metadataReady) return;
    setBusy(true);
    setError(null);
    setPhase("uploading");
    setUploadProgress(0);
    setUploadProcessing(false);
    setVideoFile(file);
    setFrames([]);
    setReport(null);
    try {
      const metadata: UploadMetadata = {
        title: metaTitle.trim(),
        location_name: metaLocation.trim(),
        incident_type: metaIncidentType.trim(),
        ...(metaCoords ? { lat: metaCoords.lat, lng: metaCoords.lng } : {}),
      };
      const res = await api.upload(file, metadata, (pct) => {
        setUploadProgress(pct);
        if (pct >= 100) setUploadProcessing(true);
      });
      setUploadProgress(100);
      setUploadProcessing(false);
      setVideoId(res.video_id);
      setPhase("streaming");
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      setVideoFile(null);
      setUploadProcessing(false);
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
    setAnalyzeProgress(0);
    setAnalyzeFrameTotal(0);
    setFrames([]);
    try {
      await api.analyzeStream(videoId, (frame, progress) => {
        setFrames((prev) => [...prev, frame]);
        if (progress.total > 0) {
          setAnalyzeFrameTotal(progress.total);
          setAnalyzeProgress(Math.round((progress.current / progress.total) * 100));
        }
        if (frame.severity === "severe" || frame.severity === "destroyed") {
          showAlert({
            frameIndex: frame.frame_index,
            severity: frame.severity,
            description: frame.description,
            frame,
          });
        }
      });
      setAnalyzeProgress(100);
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
          {phase !== "uploading" && phase !== "analyzing" && (
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${phasePillClass(phase)}`}
            >
              {phaseLabel(phase)}
            </span>
          )}
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
                uploadDisabled={!metadataReady}
                onFallbackToUpload={() => {
                  if (!metadataReady) return;
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
                    <LocationAutocomplete
                      value={metaLocation}
                      onChange={setMetaLocation}
                      onSelectLocation={(r) =>
                        setMetaCoords(r ? { lat: r.lat, lng: r.lng } : null)
                      }
                      disabled={busy}
                      placeholder="Search a place in the Philippines…"
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

                {!metadataReady && (
                  <p className="mt-3 text-[12px] text-amber-400/90">
                    Title, incident type, and a location chosen from search are required to enable
                    upload.
                  </p>
                )}

                <input
                  ref={fileInputRef}
                  id="workspace-video-file"
                  type="file"
                  accept="video/*"
                  disabled={busy || !metadataReady}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFile(file);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={busy || !metadataReady}
                  title={
                    metadataReady
                      ? undefined
                      : "Fill in title, pick a location from search results, and select incident type."
                  }
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
              {phase === "uploading" && videoFile && (
                <ProgressBar
                  label={uploadProcessing ? "Processing video on server" : "Uploading video"}
                  percent={uploadProgress}
                  indeterminate={uploadProcessing}
                  detail={
                    uploadProcessing
                      ? "Saving and registering the file. This usually takes a few seconds."
                      : `${videoFile.name} · ${formatFileSize(videoFile.size)}`
                  }
                  className="mb-3"
                />
              )}
              <VideoPlayer
                file={videoFile}
                liveMode={phase === "streaming"}
                autoPlay
                className="shrink-0"
              />
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
              <ProgressBar
                label="Analyzing frames"
                percent={analyzeProgress}
                detail={
                  analyzeFrameTotal > 0
                    ? `${frames.length} / ${analyzeFrameTotal} frames`
                    : undefined
                }
                className="mb-3"
              />
              <VideoPlayer file={videoFile} liveMode autoPlay className="shrink-0" />
              <p className="mt-4 text-[12px] leading-6 text-slate-400">
                Frames stream in as analysis runs. This can take a few minutes while the VLM works
                through the footage. Severe and critical detections trigger priority alerts and map
                focus.
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
                  onSelectFrame={inspectFrame}
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
                focusPoint={
                  metaCoords
                    ? { ...metaCoords, label: metaLocation.trim() || undefined }
                    : null
                }
              />
            </div>
          </div>
        </section>

        <aside className="card flex min-h-0 flex-col overflow-hidden p-4 xl:col-span-3">
          <FrameAnalysisFeed
            frames={frames}
            selectedFrameIndex={selectedFrameIndex}
            onSelectFrame={inspectFrame}
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
              key={videoId ?? "idle"}
              reportId={report?.report_id}
              videoId={videoId ?? undefined}
              frameContext={frameForChat}
              onClearFrameContext={onClearFrameContext}
            />
          </div>
        </aside>
      </div>

      <FrameImageModal
        frame={modalFrame}
        videoFile={videoFile}
        onClose={onCloseModal}
      />
    </div>
  );
}

export default function AssessmentsWorkspacePage({ onBack }: Props) {
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);
  const [modalFrame, setModalFrame] = useState<FrameAnalysis | null>(null);

  const inspectFrame = useCallback((frame: FrameAnalysis) => {
    setSelectedFrameIndex(frame.frame_index);
    setModalFrame(frame);
  }, []);

  const onClearFrameContext = useCallback(() => {
    setSelectedFrameIndex(null);
    setModalFrame(null);
  }, []);

  return (
    <AlertProvider onJumpToFrame={inspectFrame}>
      <WorkspaceMain
        onBack={onBack}
        selectedFrameIndex={selectedFrameIndex}
        onSelectFrame={setSelectedFrameIndex}
        inspectFrame={inspectFrame}
        modalFrame={modalFrame}
        onCloseModal={() => setModalFrame(null)}
        onClearFrameContext={onClearFrameContext}
      />
    </AlertProvider>
  );
}
