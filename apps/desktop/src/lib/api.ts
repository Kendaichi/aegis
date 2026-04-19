import { mockApi } from "./mockApi";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const BASE = API_BASE_URL;

export type DamageSeverity =
  | "none"
  | "minor"
  | "moderate"
  | "severe"
  | "destroyed";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export type AssessmentStatus = "pending" | "analyzing" | "complete";

export interface UploadMetadata {
  title?: string;
  location_name?: string;
  incident_type?: string;
  lat?: number;
  lng?: number;
}

export interface UploadResponse {
  video_id: string;
  filename: string;
  size_bytes: number;
  content_type: string | null;
  title: string | null;
  location_name: string | null;
  incident_type: string | null;
  lat: number | null;
  lng: number | null;
  status: AssessmentStatus;
  created_at: string;
}

export interface VideoListItem {
  video_id: string;
  filename: string;
  size_bytes: number;
  content_type: string | null;
  created_at: string;
}

export interface VideoListResponse {
  videos: VideoListItem[];
  total: number;
}

/** Localized damage region; bbox is normalized x1,y1,x2,y2 in [0,1], origin top-left. */
export interface Detection {
  label: string;
  severity: DamageSeverity;
  bbox: [number, number, number, number];
  confidence: number;
}

export interface FrameAnalysis {
  frame_index: number;
  timestamp_seconds: number;
  severity: DamageSeverity;
  description: string;
  detected_hazards: string[];
  confidence: number;
  /** Per-frame GPS when available (streaming / real analysis). /*/
  location?: GeoPoint;
  /** API-relative or absolute URL for the extracted frame JPEG. */
  image_url?: string | null;
  /** AI-localized regions (bounding boxes) for this frame. */
  detections?: Detection[];
}

/** Resolve a frame image URL for <img src={...}> (prepends API base when path is relative). */
export function frameImageUrl(image_url: string): string {
  if (!image_url) return "";
  if (image_url.startsWith("http://") || image_url.startsWith("https://")) return image_url;
  const root = BASE.replace(/\/$/, "");
  const path = image_url.startsWith("/") ? image_url : `/${image_url}`;
  return `${root}${path}`;
}

/** Called for each frame as analysis streams in (mock or SSE/WebSocket later). */
export type StreamFrameCallback = (
  frame: FrameAnalysis,
  progress: { current: number; total: number }
) => void;

export interface AnalyzeResponse {
  video_id: string;
  frame_count: number;
  frames: FrameAnalysis[];
}

export interface AnalyzeJobResponse {
  video_id: string;
  status: "processing" | "complete";
  frame_count: number;
  frames: FrameAnalysis[];
}

export interface Report {
  report_id: string;
  video_id: string;
  summary: string;
  overall_severity: DamageSeverity;
  key_findings: string[];
  recommendations: string[];
  location: GeoPoint | null;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponse {
  session_id: string;
  message: ChatMessage;
}

export interface HealthResponse {
  status: string;
  model: string;
  /** Backend VLM mode: mock | real (Ollama) | zai */
  vlm_mode?: string;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

const realApi = {
  async upload(file: File, metadata: UploadMetadata = {}): Promise<UploadResponse> {
    const body = new FormData();
    body.append("file", file);
    if (metadata.title) body.append("title", metadata.title);
    if (metadata.location_name) body.append("location_name", metadata.location_name);
    if (metadata.incident_type) body.append("incident_type", metadata.incident_type);
    if (metadata.lat !== undefined) body.append("lat", String(metadata.lat));
    if (metadata.lng !== undefined) body.append("lng", String(metadata.lng));
    const res = await fetch(`${BASE}/upload`, { method: "POST", body });
    return handle(res);
  },

  async listVideos(): Promise<VideoListResponse> {
    const res = await fetch(`${BASE}/upload`);
    return handle(res);
  },

  async listReports(video_id?: string): Promise<Report[]> {
    const url = video_id
      ? `${BASE}/report?video_id=${encodeURIComponent(video_id)}`
      : `${BASE}/report`;
    const res = await fetch(url);
    return handle(res);
  },

  async getReport(report_id: string): Promise<Report> {
    const res = await fetch(`${BASE}/report/${encodeURIComponent(report_id)}`);
    return handle(res);
  },

  async getFrames(video_id: string): Promise<AnalyzeResponse> {
    const res = await fetch(`${BASE}/analyze/${encodeURIComponent(video_id)}`);
    return handle(res);
  },

  async analyze(video_id: string, location?: GeoPoint): Promise<AnalyzeResponse> {
    const res = await fetch(`${BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_id, location }),
    });
    return handle(res);
  },

  async getAnalysis(video_id: string): Promise<AnalyzeResponse> {
    const res = await fetch(`${BASE}/analyze/${encodeURIComponent(video_id)}`);
    return handle(res);
  },

  async report(video_id: string, location?: GeoPoint): Promise<Report> {
    const res = await fetch(`${BASE}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_id, location }),
    });
    return handle(res);
  },

  async chat(
    messages: ChatMessage[],
    opts: {
      session_id?: string;
      report_id?: string;
      video_id?: string;
    } = {}
  ): Promise<ChatResponse> {
    const res = await fetch(`${BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, ...opts }),
    });
    return handle(res);
  },

  async health(): Promise<HealthResponse> {
    const res = await fetch(`${BASE}/health`);
    return handle(res);
  },

  async analyzeStream(
    video_id: string,
    onFrame: StreamFrameCallback,
    location?: GeoPoint
  ): Promise<AnalyzeResponse> {
    // Start the background job
    const jobRes = await fetch(`${BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_id, location }),
    });
    const job = await handle<AnalyzeJobResponse>(jobRes);

    // Already cached — replay frames immediately
    if (job.status === "complete") {
      job.frames.forEach((frame, i) => {
        onFrame(frame, { current: i + 1, total: job.frames.length });
      });
      return { video_id, frame_count: job.frames.length, frames: job.frames };
    }

    // Subscribe to SSE stream for live frame delivery
    return new Promise((resolve, reject) => {
      const es = new EventSource(`${BASE}/analyze/${encodeURIComponent(video_id)}/stream`);
      const frames: FrameAnalysis[] = [];

      es.addEventListener("frame", (e: MessageEvent) => {
        const frame = JSON.parse(e.data) as FrameAnalysis;
        frames.push(frame);
        onFrame(frame, { current: frames.length, total: -1 });
      });

      es.addEventListener("done", () => {
        es.close();
        resolve({ video_id, frame_count: frames.length, frames });
      });

      es.addEventListener("error", (e: MessageEvent) => {
        es.close();
        reject(new Error((e as unknown as { data?: string }).data
          ? JSON.parse((e as unknown as { data: string }).data).detail
          : "Analysis stream failed"));
      });

      es.onerror = () => {
        if (es.readyState === EventSource.CLOSED) {
          // Server closed connection cleanly (after done event was already handled)
          return;
        }
        es.close();
        reject(new Error("SSE connection lost"));
      };
    });
  },
};

const useMockApi = import.meta.env.VITE_USE_MOCK_API === "true";

export const api = useMockApi ? mockApi : realApi;
