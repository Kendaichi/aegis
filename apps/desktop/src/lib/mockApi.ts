import type {
  AnalyzeResponse,
  ChatMessage,
  ChatResponse,
  FrameAnalysis,
  GeoPoint,
  HealthResponse,
  Report,
  StreamFrameCallback,
  UploadMetadata,
  UploadResponse,
  VideoListItem,
  VideoListResponse,
} from "./api";

function sleep(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelayMs(): number {
  return 1500 + Math.floor(Math.random() * 500);
}

function nowIso(): string {
  return new Date().toISOString();
}

function makeVideoId(): string {
  return `mock_${Date.now().toString(36)}`;
}

const MOCK_LOCATION: GeoPoint = { lat: 8.9475, lng: 125.5406 };

/** Jittered points around Butuan for per-frame map pins */
function frameLocation(index: number): GeoPoint {
  const jitter = (i: number, spread: number) => (Math.sin(i * 1.7) * 0.5 + 0.5) * spread - spread / 2;
  return {
    lat: MOCK_LOCATION.lat + jitter(index, 0.025),
    lng: MOCK_LOCATION.lng + jitter(index + 2, 0.035),
  };
}

function withMockVisuals(frames: FrameAnalysis[]): FrameAnalysis[] {
  return frames.map((f) => {
    const j = (f.frame_index % 5) * 0.015;
    return {
      ...f,
      image_url: `https://picsum.photos/seed/aegis${f.frame_index}/800/450`,
      detections: [
        {
          label: "Primary damage / hazard region",
          severity: f.severity,
          bbox: [0.15 + j, 0.2, 0.62 + j, 0.78] as [number, number, number, number],
          confidence: 0.78,
        },
        {
          label: "Secondary risk zone",
          severity: f.severity === "none" ? "minor" : "moderate",
          bbox: [0.52, 0.1, 0.9, 0.45] as [number, number, number, number],
          confidence: 0.65,
        },
      ],
    };
  });
}

const MOCK_FRAMES_RAW: FrameAnalysis[] = [
  {
    frame_index: 0,
    timestamp_seconds: 0,
    severity: "moderate",
    description: "Flooding around roadside homes; water line visible against foundations.",
    detected_hazards: ["flooding", "debris"],
    confidence: 0.82,
    location: frameLocation(0),
  },
  {
    frame_index: 1,
    timestamp_seconds: 2,
    severity: "severe",
    description: "Visible roof collapse on adjacent structures.",
    detected_hazards: ["structural collapse"],
    confidence: 0.88,
    location: frameLocation(1),
  },
  {
    frame_index: 2,
    timestamp_seconds: 4,
    severity: "moderate",
    description: "Road shoulder erosion and standing water.",
    detected_hazards: ["road damage", "flooding"],
    confidence: 0.79,
    location: frameLocation(2),
  },
  {
    frame_index: 3,
    timestamp_seconds: 6,
    severity: "minor",
    description: "Debris accumulation near drainage lines.",
    detected_hazards: ["debris"],
    confidence: 0.74,
    location: frameLocation(3),
  },
  {
    frame_index: 4,
    timestamp_seconds: 8,
    severity: "severe",
    description: "Route may be impassable due to deep water.",
    detected_hazards: ["flooding", "access blockage"],
    confidence: 0.86,
    location: frameLocation(4),
  },
  {
    frame_index: 5,
    timestamp_seconds: 10,
    severity: "none",
    description: "Open stretch; no immediate structural threat in frame.",
    detected_hazards: [],
    confidence: 0.71,
    location: frameLocation(5),
  },
  {
    frame_index: 6,
    timestamp_seconds: 12,
    severity: "destroyed",
    description: "Multiple structures show total roof loss; possible trap hazard under debris.",
    detected_hazards: ["structural collapse", "trap", "debris"],
    confidence: 0.91,
    location: frameLocation(6),
  },
  {
    frame_index: 7,
    timestamp_seconds: 14,
    severity: "moderate",
    description: "Downed power lines near standing water — electrocution risk.",
    detected_hazards: ["electrical", "flooding"],
    confidence: 0.84,
    location: frameLocation(7),
  },
  {
    frame_index: 8,
    timestamp_seconds: 16,
    severity: "minor",
    description: "Localized mudslides on embankment; monitor for further slip.",
    detected_hazards: ["landslide"],
    confidence: 0.77,
    location: frameLocation(8),
  },
  {
    frame_index: 9,
    timestamp_seconds: 18,
    severity: "severe",
    description: "Bridge approach submerged; alternate route required.",
    detected_hazards: ["flooding", "access blockage"],
    confidence: 0.89,
    location: frameLocation(9),
  },
];

const MOCK_ANALYZE: AnalyzeResponse = {
  video_id: "mock_video",
  frame_count: MOCK_FRAMES_RAW.length,
  frames: withMockVisuals(MOCK_FRAMES_RAW),
};

function buildMockReport(videoId: string, location?: GeoPoint): Report {
  return {
    report_id: `r_${videoId}`,
    video_id: videoId,
    summary:
      "Significant localized flooding and structural impacts detected. Prioritize access restoration and high-risk households.",
    overall_severity: "severe",
    key_findings: [
      "Multiple frames indicate road passability concerns.",
      "One cluster shows severe structural roof damage and trap hazards under debris.",
      "Debris and standing water raise secondary hazard risk.",
    ],
    recommendations: [
      "Deploy clearing teams to blocked routes.",
      "Prioritize evacuation support for heavily damaged structures.",
      "Stage relief and medical supplies near accessible perimeter points.",
    ],
    location: location ?? MOCK_LOCATION,
    created_at: nowIso(),
  };
}

// In-memory stores seeded with a couple of archive entries.
const SEED_VIDEO_IDS = ["seed_aurora_2024", "seed_butuan_2024", "seed_zambo_2024"];
const videoStore: VideoListItem[] = SEED_VIDEO_IDS.map((id, i) => ({
  video_id: id,
  filename: `${id}.mp4`,
  size_bytes: 1024 * 1024 * (12 + i * 3),
  content_type: "video/mp4",
  created_at: new Date(Date.now() - (i + 1) * 86_400_000).toISOString(),
}));
const reportStore: Report[] = SEED_VIDEO_IDS.map((id) => buildMockReport(id));

export const mockApi = {
  async upload(
    file: File,
    metadata: UploadMetadata = {},
    onProgress?: (pct: number) => void
  ): Promise<UploadResponse> {
    if (onProgress) {
      const ticks = [0, 35, 75, 100];
      const betweenMs = [180, 220, 160];
      for (let i = 0; i < ticks.length; i++) {
        onProgress(ticks[i]);
        if (i < betweenMs.length) await sleep(betweenMs[i]);
      }
    } else {
      await sleep(500);
    }
    const item: VideoListItem = {
      video_id: makeVideoId(),
      filename: file.name || "mock-video.mp4",
      size_bytes: file.size || 123456,
      content_type: file.type || "video/mp4",
      created_at: nowIso(),
      title: metadata.title ?? file.name ?? "mock-video",
      location_name: metadata.location_name ?? null,
      incident_type: metadata.incident_type ?? null,
      lat: metadata.lat ?? null,
      lng: metadata.lng ?? null,
    };
    videoStore.unshift(item);
    return {
      video_id: item.video_id,
      filename: item.filename,
      size_bytes: item.size_bytes,
      content_type: item.content_type,
      title: metadata.title ?? file.name ?? "mock-video",
      location_name: metadata.location_name ?? null,
      incident_type: metadata.incident_type ?? null,
      lat: metadata.lat ?? null,
      lng: metadata.lng ?? null,
      status: "pending",
      created_at: item.created_at,
    };
  },

  async listVideos(): Promise<VideoListResponse> {
    await sleep(250);
    return { videos: [...videoStore], total: videoStore.length };
  },

  async getFrames(video_id: string): Promise<AnalyzeResponse> {
    await sleep(300);
    return {
      ...MOCK_ANALYZE,
      video_id,
      frames: MOCK_ANALYZE.frames.map((f) => ({ ...f })),
    };
  },

  async analyze(video_id: string, _location?: GeoPoint): Promise<AnalyzeResponse> {
    await sleep(800);
    return {
      ...MOCK_ANALYZE,
      video_id,
      frames: MOCK_ANALYZE.frames.map((f) => ({ ...f })),
    };
  },

  async getAnalysis(video_id: string): Promise<AnalyzeResponse> {
    await sleep(300);
    return {
      ...MOCK_ANALYZE,
      video_id,
      frames: MOCK_ANALYZE.frames.map((f) => ({ ...f })),
    };
  },

  async analyzeStream(
    video_id: string,
    onFrame: StreamFrameCallback,
    _location?: GeoPoint
  ): Promise<AnalyzeResponse> {
    const total = MOCK_ANALYZE.frames.length;
    const frames: FrameAnalysis[] = [];
    for (let i = 0; i < total; i++) {
      if (i > 0) await sleep(randomDelayMs());
      const frame = { ...MOCK_ANALYZE.frames[i] };
      frames.push(frame);
      onFrame(frame, { current: i + 1, total });
    }
    return {
      video_id,
      frame_count: total,
      frames,
    };
  },

  async report(video_id: string, location?: GeoPoint): Promise<Report> {
    await sleep(1000);
    const report = buildMockReport(video_id, location);
    reportStore.unshift(report);
    return report;
  },

  async listReports(video_id?: string): Promise<Report[]> {
    await sleep(250);
    const list = video_id ? reportStore.filter((r) => r.video_id === video_id) : reportStore;
    return list.map((r) => ({ ...r }));
  },

  async getReport(report_id: string): Promise<Report> {
    await sleep(200);
    const match = reportStore.find((r) => r.report_id === report_id);
    if (!match) throw new Error(`404 Not Found: report ${report_id}`);
    return { ...match };
  },

  async chat(
    messages: ChatMessage[],
    opts: {
      session_id?: string;
      report_id?: string;
      video_id?: string;
    } = {}
  ): Promise<ChatResponse> {
    await sleep(450);
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const systemHint = [...messages].reverse().find((m) => m.role === "system");
    const question = lastUser?.content ?? "your question";
    const frameNote = systemHint ? ` (Context: ${systemHint.content.slice(0, 160)})` : "";
    return {
      session_id: opts.session_id ?? `sess_${Date.now().toString(36)}`,
      message: {
        role: "assistant",
        content:
          `Mock mode: top priority is flood-affected access routes and structurally damaged homes.${frameNote}\n\n` +
          `You asked: "${question}"\n` +
          `Context: report_id=${opts.report_id ?? "n/a"}, video_id=${opts.video_id ?? "n/a"}.`,
      },
    };
  },

  async health(): Promise<HealthResponse> {
    await sleep(100);
    return { status: "ok", model: "mock", vlm_mode: "mock" };
  },
};
