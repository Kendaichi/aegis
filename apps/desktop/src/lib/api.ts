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

export interface FrameAnalysis {
  frame_index: number;
  timestamp_seconds: number;
  severity: DamageSeverity;
  description: string;
  detected_hazards: string[];
  confidence: number;
}

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

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async upload(file: File): Promise<UploadResponse> {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch(`${BASE}/upload`, { method: "POST", body });
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
    opts: { report_id?: string; video_id?: string } = {}
  ): Promise<{ message: ChatMessage }> {
    const res = await fetch(`${BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, ...opts }),
    });
    return handle(res);
  },
};
