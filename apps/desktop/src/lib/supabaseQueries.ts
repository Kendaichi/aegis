/**
 * Supabase-backed read models + realtime subscriptions for dashboard surfaces.
 *
 * The desktop app is a read-heavy dashboard layered over the backend queue:
 *   videos (pending -> analyzing -> complete) --> reports
 * Realtime subscriptions here translate queue progression into live UI.
 */

import { supabase } from "./supabase";
import type {
  ActivityItem,
  AssessmentRow,
  AssessmentStatus,
  DashboardStats,
  MapViewMarker,
  MapViewSummary,
  SeverityDistributionItem,
  SeverityLevel,
  SidebarIncident,
} from "./mockData";

type OverallSeverity = "none" | "minor" | "moderate" | "severe" | "destroyed";

interface VideoRow {
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
  assessment_code: string | null;
  created_at: string;
}

interface ReportRow {
  report_id: string;
  video_id: string;
  overall_severity: OverallSeverity;
  incident_type: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

function severityToLevel(sev: OverallSeverity | null | undefined): SeverityLevel {
  switch (sev) {
    case "destroyed":
      return 5;
    case "severe":
      return 4;
    case "moderate":
      return 3;
    case "minor":
    case "none":
    default:
      return 2;
  }
}

function filenameToTitle(filename: string): string {
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  return withoutExt.replace(/[_-]+/g, " ").trim() || filename;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function displayId(v: VideoRow): string {
  return v.assessment_code ?? v.video_id.slice(0, 10);
}

async function loadVideosAndReports(): Promise<{ videos: VideoRow[]; reports: ReportRow[] }> {
  const [videosRes, reportsRes] = await Promise.all([
    supabase.from("videos").select("*").order("created_at", { ascending: false }),
    supabase.from("reports").select("*").order("created_at", { ascending: false }),
  ]);
  if (videosRes.error) throw videosRes.error;
  if (reportsRes.error) throw reportsRes.error;
  return {
    videos: (videosRes.data ?? []) as VideoRow[],
    reports: (reportsRes.data ?? []) as ReportRow[],
  };
}

function buildReportByVideo(reports: ReportRow[]): Map<string, ReportRow> {
  const map = new Map<string, ReportRow>();
  for (const r of reports) {
    const existing = map.get(r.video_id);
    if (!existing || new Date(r.created_at) > new Date(existing.created_at)) {
      map.set(r.video_id, r);
    }
  }
  return map;
}

function videoToRow(v: VideoRow, report?: ReportRow): AssessmentRow {
  const status: AssessmentStatus = report ? "complete" : (v.status as AssessmentStatus);
  const location =
    v.location_name ??
    (v.lat != null && v.lng != null
      ? `${v.lat.toFixed(3)}, ${v.lng.toFixed(3)}`
      : "Unknown location");
  return {
    id: displayId(v),
    videoId: v.video_id,
    title: v.title || filenameToTitle(v.filename),
    subtitle: v.size_bytes ? `${(v.size_bytes / (1024 * 1024)).toFixed(1)} MB` : "",
    location,
    type: v.incident_type ?? "Unknown",
    severity: severityToLevel(report?.overall_severity),
    status,
    date: new Date(v.created_at).toISOString().slice(0, 10),
  };
}

export async function fetchRecentAssessments(limit = 4): Promise<AssessmentRow[]> {
  const { videos, reports } = await loadVideosAndReports();
  const reportByVideo = buildReportByVideo(reports);
  return videos.slice(0, limit).map((v) => videoToRow(v, reportByVideo.get(v.video_id)));
}

/**
 * Items currently flowing through the queue: pending uploads + analyses in
 * progress, with a tail of the most recent completions so the panel always
 * has content.
 */
export async function fetchActiveIncidents(limit = 3): Promise<SidebarIncident[]> {
  const { videos, reports } = await loadVideosAndReports();
  const reportByVideo = buildReportByVideo(reports);

  const live = videos.filter((v) => v.status === "pending" || v.status === "analyzing");
  const done = videos.filter((v) => v.status === "complete");
  const ordered = [...live, ...done].slice(0, limit);

  return ordered.map((v) => {
    const report = reportByVideo.get(v.video_id);
    return {
      id: displayId(v),
      videoId: v.video_id,
      location:
        v.location_name ?? v.title ?? filenameToTitle(v.filename) ?? "Unknown location",
      timeAgo: timeAgo(v.created_at),
      severity: severityToLevel(report?.overall_severity),
      status: v.status as AssessmentStatus,
    };
  });
}

export async function fetchSeverityDistribution(): Promise<SeverityDistributionItem[]> {
  const { data, error } = await supabase.from("reports").select("overall_severity");
  if (error) throw error;

  const rows = (data ?? []) as Array<{ overall_severity: OverallSeverity }>;
  const buckets: Record<SeverityLevel, number> = { 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of rows) {
    buckets[severityToLevel(r.overall_severity)] += 1;
  }
  const total = Object.values(buckets).reduce((a, b) => a + b, 0);
  const labels: Record<SeverityLevel, string> = {
    5: "Critical",
    4: "Severe",
    3: "Moderate",
    2: "Minor",
  };

  return ([5, 4, 3, 2] as SeverityLevel[]).map((level) => ({
    level,
    label: labels[level],
    zones: buckets[level],
    pct: total === 0 ? 0 : Math.round((buckets[level] / total) * 100),
  }));
}

export async function fetchMapMarkers(): Promise<MapViewMarker[]> {
  const { videos, reports } = await loadVideosAndReports();
  const reportByVideo = buildReportByVideo(reports);

  return videos
    .filter((v) => v.lat != null && v.lng != null)
    .map((v) => {
      const report = reportByVideo.get(v.video_id);
      const lat = report?.lat ?? (v.lat as number);
      const lng = report?.lng ?? (v.lng as number);
      return {
        id: v.video_id,
        lat,
        lng,
        severity: severityToLevel(report?.overall_severity),
        label: v.title ?? filenameToTitle(v.filename),
        assessmentId: displayId(v),
        hazardType: v.incident_type ?? "Unknown",
        region: v.location_name ?? "Caraga",
      };
    });
}

export function summarizeMarkers(markers: MapViewMarker[]): MapViewSummary {
  return {
    critical: markers.filter((m) => m.severity === 5).length,
    severe: markers.filter((m) => m.severity === 4).length,
    moderate: markers.filter((m) => m.severity === 3).length,
    minor: markers.filter((m) => m.severity === 2).length,
    roadsBlocked: 0,
    lastUpdated: "Just now",
  };
}

/**
 * Returns a (markerId -> AssessmentStatus) map so panels can render queue
 * state without having to join against mock assessment data.
 */
export async function fetchMarkerStatusMap(): Promise<Record<string, AssessmentStatus>> {
  const { videos, reports } = await loadVideosAndReports();
  const reportByVideo = buildReportByVideo(reports);
  const out: Record<string, AssessmentStatus> = {};
  for (const v of videos) {
    out[v.video_id] = reportByVideo.has(v.video_id)
      ? "complete"
      : (v.status as AssessmentStatus);
  }
  return out;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { videos, reports } = await loadVideosAndReports();

  const inProgress = videos.filter((v) => v.status === "analyzing").length;
  const pending = videos.filter((v) => v.status === "pending").length;

  const reportByVideo = buildReportByVideo(reports);
  const barangays = new Set<string>();
  for (const v of videos) {
    if (reportByVideo.has(v.video_id) && v.location_name) {
      barangays.add(v.location_name);
    }
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

  let assessmentsToday = 0;
  let assessmentsYesterday = 0;
  for (const v of videos) {
    const ts = new Date(v.created_at).getTime();
    if (ts >= startOfToday) assessmentsToday += 1;
    else if (ts >= startOfYesterday) assessmentsYesterday += 1;
  }

  const videoCreatedAt = new Map(videos.map((v) => [v.video_id, new Date(v.created_at).getTime()]));
  const durationsMs: number[] = [];
  for (const r of reports) {
    const uploadedTs = videoCreatedAt.get(r.video_id);
    if (uploadedTs == null) continue;
    const elapsed = new Date(r.created_at).getTime() - uploadedTs;
    if (elapsed > 0) durationsMs.push(elapsed);
  }
  const avgAssessmentTimeMinutes =
    durationsMs.length === 0
      ? 0
      : Math.round(durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length / 60000);

  return {
    activeAssessments: {
      total: inProgress + pending,
      inProgress,
      pending,
    },
    affectedBarangays: barangays.size,
    assessmentsToday,
    deltaFromYesterday: assessmentsToday - assessmentsYesterday,
    avgAssessmentTimeMinutes,
  };
}

export interface BookmarkedArea {
  name: string;
  lat: number;
  lng: number;
}

/** Unique `location_name` values from videos, newest activity first. Pass `limit` to cap the list. */
export async function fetchBookmarkedAreas(limit?: number): Promise<BookmarkedArea[]> {
  const { data, error } = await supabase
    .from("videos")
    .select("location_name, lat, lng, created_at")
    .not("location_name", "is", null);
  if (error) throw error;

  type Row = {
    location_name: string | null;
    lat: number | null;
    lng: number | null;
    created_at: string;
  };

  const byName = new Map<
    string,
    { count: number; lat: number; lng: number; latestTs: number }
  >();

  for (const row of (data ?? []) as Row[]) {
    const name = row.location_name?.trim();
    if (!name || row.lat == null || row.lng == null) continue;
    const ts = new Date(row.created_at).getTime();
    const prev = byName.get(name);
    if (!prev) {
      byName.set(name, { count: 1, lat: row.lat, lng: row.lng, latestTs: ts });
    } else {
      prev.count += 1;
      if (ts > prev.latestTs) {
        prev.latestTs = ts;
        prev.lat = row.lat;
        prev.lng = row.lng;
      }
    }
  }

  const rows = [...byName.entries()]
    .map(([name, v]) => ({ name, lat: v.lat, lng: v.lng, latestTs: v.latestTs }))
    .sort((a, b) => b.latestTs - a.latestTs || a.name.localeCompare(b.name));

  const capped = limit != null ? rows.slice(0, limit) : rows;
  return capped.map(({ name, lat, lng }) => ({ name, lat, lng }));
}

export async function fetchActivityFeed(limit = 8): Promise<ActivityItem[]> {
  const { videos, reports } = await loadVideosAndReports();
  type Stamped = ActivityItem & { __ts: number };
  const events: Stamped[] = [];

  for (const v of videos) {
    const code = displayId(v);
    const ts = new Date(v.created_at).getTime();
    let item: ActivityItem;
    if (v.status === "analyzing") {
      item = {
        id: `vlm-${v.video_id}`,
        text: `VLM analysis in progress — ${code}`,
        time: timeAgo(v.created_at),
        kind: "vlm",
      };
    } else if (v.status === "pending") {
      item = {
        id: `queue-${v.video_id}`,
        text: `Queued for analysis — ${v.title ?? v.filename}`,
        time: timeAgo(v.created_at),
        kind: "system",
      };
    } else {
      item = {
        id: `extract-${v.video_id}`,
        text: `Frame extraction complete — ${code}`,
        time: timeAgo(v.created_at),
        kind: "extract",
      };
    }
    events.push({ ...item, __ts: ts });
  }

  for (const r of reports) {
    events.push({
      id: `report-${r.report_id}`,
      text: `Report generated — ${r.video_id.slice(0, 10)}`,
      time: timeAgo(r.created_at),
      kind: "report",
      __ts: new Date(r.created_at).getTime(),
    });
  }

  return events
    .sort((a, b) => b.__ts - a.__ts)
    .slice(0, limit)
    .map(({ __ts: _ts, ...rest }) => rest);
}

// ── Chat persistence ──────────────────────────────────────────────────────────

export interface ChatRow {
  role: "user" | "assistant";
  content: string;
  session_id: string | null;
}

export async function fetchChatMessages(videoId: string): Promise<{ rows: ChatRow[]; sessionId: string | undefined }> {
  const { data, error } = await supabase
    .from("chat_history")
    .select("role, content, session_id")
    .eq("video_id", videoId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as ChatRow[];
  const sessionId = [...rows].reverse().find((r) => r.session_id != null)?.session_id ?? undefined;
  return { rows, sessionId };
}

export async function appendChatMessages(
  videoId: string,
  sessionId: string | undefined,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<void> {
  const { error } = await supabase.from("chat_history").insert(
    messages.map((m) => ({ video_id: videoId, session_id: sessionId ?? null, ...m }))
  );
  if (error) throw error;
}

/**
 * Subscribe to any changes that affect queue-derived dashboard views.
 * The caller re-queries its data on each notification; this keeps the
 * subscription coarse and the UI simple.
 */
export function subscribeToQueueUpdates(onChange: () => void): () => void {
  const channel = supabase
    .channel(`queue-updates-${Math.random().toString(36).slice(2, 8)}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "videos" },
      () => onChange()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "reports" },
      () => onChange()
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
