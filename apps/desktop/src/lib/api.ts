import { mockApi } from "./mockApi";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

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

export interface UploadResponse {
  video_id: string;
  filename: string;
  size_bytes: number;
  content_type: string | null;
  created_at: string;
}

export interface VideoListItem {
  video_id: string;
  filename: string;
  size_bytes: number;
  content_type: string | null;
  created_at: string;
  url: string | null;
}

export interface VideoListResponse {
  videos: VideoListItem[];
  total: number;
}

export interface FrameAnalysis {
  frame_index: number;
  timestamp_seconds: number;
  severity: DamageSeverity;
  description: string;
  detected_hazards: string[];
  confidence: number;
  /** Per-frame GPS when available (streaming / real analysis). */
  location?: GeoPoint;
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
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

const realApi = {
  async upload(file: File): Promise<UploadResponse> {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch(`${BASE}/upload`, { method: "POST", body });
    return handle(res);
  },

  async listVideos(): Promise<VideoListResponse> {
    const res = await fetch(`${BASE}/upload`);
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

  async listReports(video_id?: string): Promise<Report[]> {
    const qs = video_id ? `?video_id=${encodeURIComponent(video_id)}` : "";
    const res = await fetch(`${BASE}/report${qs}`);
    return handle(res);
  },

  async getReport(report_id: string): Promise<Report> {
    const res = await fetch(`${BASE}/report/${encodeURIComponent(report_id)}`);
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

  /**
   * Stream analysis: real backend may use SSE; placeholder yields batch frames sequentially.
   */
  async analyzeStream(
    video_id: string,
    onFrame: StreamFrameCallback,
    location?: GeoPoint
  ): Promise<AnalyzeResponse> {
    const res = await realApi.analyze(video_id, location);
    for (let i = 0; i < res.frames.length; i++) {
      onFrame(res.frames[i], { current: i + 1, total: res.frames.length });
    }
    return res;
  },
};

const useMockApi = import.meta.env.VITE_USE_MOCK_API === "true";

export const api = useMockApi ? mockApi : realApi;
