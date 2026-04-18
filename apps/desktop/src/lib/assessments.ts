import type { DamageSeverity, Report, VideoListItem } from "./api";
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

function locationLabel(report: Report | undefined): string {
  if (!report?.location) return "Location pending";
  const { lat, lng } = report.location;
  return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
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
      title: video.filename || `Assessment ${shortId(video.video_id)}`,
      subtitle: `${formatSize(video.size_bytes)} • ${video.content_type ?? "video"}`,
      location: locationLabel(report),
      type: report ? "Assessment" : "Unanalyzed",
      severity: severityToLevel(report?.overall_severity),
      status,
      date: formatDate(video.created_at),
    };
  });
}

export function reportToListItem(report: Report, pageCount = 0): ReportListItem {
  const sevLevel = severityToLevel(report.overall_severity);
  return {
    id: report.report_id,
    assessmentId: report.video_id,
    title: `Assessment ${shortId(report.video_id)}`,
    location: locationLabel(report),
    type: "Assessment",
    severity: sevLevel,
    status: "complete",
    date: formatDate(report.created_at),
    pages: pageCount || Math.max(4, report.key_findings.length + report.recommendations.length + 2),
  };
}
