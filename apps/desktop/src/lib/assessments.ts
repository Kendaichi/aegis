import type { DamageSeverity, FrameAnalysis, Report, VideoListItem } from "./api";

/** Matches backend `app/services/report.py` `_SEVERITY_ORDER` for key_findings frame ordering. */
export const SEVERITY_ORDER: readonly DamageSeverity[] = [
  "none",
  "minor",
  "moderate",
  "severe",
  "destroyed",
] as const;

function severityRank(severity: DamageSeverity): number {
  const i = SEVERITY_ORDER.indexOf(severity);
  return i === -1 ? 0 : i;
}

/** Top frames by severity (highest first), same rule as persisted `report.key_findings`. */
export function topKeyFrames(frames: FrameAnalysis[], limit = 5): FrameAnalysis[] {
  if (!frames.length) return [];
  return [...frames]
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
    .slice(0, limit);
}
import type {
  AssessmentRow,
  AssessmentStatus,
  ReportListItem,
  SeverityLevel,
} from "./mockData";

export function severityToLevel(severity: DamageSeverity | null | undefined): SeverityLevel {
  switch (severity) {
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

function shortId(videoId: string): string {
  return videoId.slice(0, 8);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

function locationLabel(report: Report | undefined, video: VideoListItem): string {
  if (report?.location) {
    const { lat, lng } = report.location;
    const name = video.location_name?.trim();
    return name || `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  }
  if (video.lat != null && video.lng != null) {
    const name = video.location_name?.trim();
    return name || `${video.lat.toFixed(3)}, ${video.lng.toFixed(3)}`;
  }
  return "Location pending";
}

export function deriveAssessments(
  videos: VideoListItem[],
  reports: Report[]
): AssessmentRow[] {
  const reportByVideo = new Map<string, Report>();
  for (const r of reports) {
    const existing = reportByVideo.get(r.video_id);
    if (!existing || new Date(r.created_at) > new Date(existing.created_at)) {
      reportByVideo.set(r.video_id, r);
    }
  }

  return videos.map((video) => {
    const report = reportByVideo.get(video.video_id);
    const status: AssessmentStatus = report ? "complete" : "pending";
    return {
      id: video.video_id,
      videoId: video.video_id,
      title: video.filename || `Assessment ${shortId(video.video_id)}`,
      subtitle: `${formatSize(video.size_bytes)} • ${video.content_type ?? "video"}`,
      location: locationLabel(report, video),
      type: report ? "Assessment" : "Unanalyzed",
      severity: severityToLevel(report?.overall_severity),
      status,
      date: formatDate(video.created_at),
    };
  });
}

export function reportToListItem(report: Report, pageCount = 0): ReportListItem {
  const sevLevel = severityToLevel(report.overall_severity);
  const location =
    report.location != null
      ? `${report.location.lat.toFixed(3)}, ${report.location.lng.toFixed(3)}`
      : "Location pending";
  return {
    id: report.report_id,
    assessmentId: report.video_id,
    title: `Assessment ${shortId(report.video_id)}`,
    location,
    type: "Assessment",
    severity: sevLevel,
    status: "complete",
    date: formatDate(report.created_at),
    pages: pageCount || Math.max(4, report.key_findings.length + report.recommendations.length + 2),
  };
}
