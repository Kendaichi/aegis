import type {
  AnalyzeResponse,
  ChatMessage,
  FrameAnalysis,
  GeoPoint,
  Report,
  StreamFrameCallback,
  UploadResponse,
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

const MOCK_ANALYZE: AnalyzeResponse = {
  video_id: "mock_video",
  frame_count: 10,
  frames: [
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
  ],
};

function buildMockReport(videoId: string, location?: GeoPoint): Report {
  return {
    report_id: `r_${Date.now().toString(36)}`,
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

export const mockApi = {
  async upload(file: File): Promise<UploadResponse> {
    await sleep(500);
    return {
      video_id: makeVideoId(),
      filename: file.name || "mock-video.mp4",
      size_bytes: file.size || 123456,
      content_type: file.type || "video/mp4",
      created_at: nowIso(),
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
    return buildMockReport(video_id, location);
  },

  async chat(
    messages: ChatMessage[],
    opts: {
      report_id?: string;
      video_id?: string;
      frame_context?: FrameAnalysis;
    } = {}
  ): Promise<{ message: ChatMessage }> {
    await sleep(450);
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const question = lastUser?.content ?? "your question";
    const fc = opts.frame_context;
    const frameNote = fc
      ? ` Frame #${fc.frame_index} (${fc.severity}): "${fc.description.slice(0, 120)}${fc.description.length > 120 ? "…" : ""}"`
      : "";
    return {
      message: {
        role: "assistant",
        content:
          `Mock mode: top priority is flood-affected access routes and structurally damaged homes.${frameNote}\n\n` +
          `You asked: "${question}"\n` +
          `Context: report_id=${opts.report_id ?? "n/a"}, video_id=${opts.video_id ?? "n/a"}.`,
      },
    };
  },
};
