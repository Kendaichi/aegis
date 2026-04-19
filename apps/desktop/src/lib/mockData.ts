/**
 * Frontend-only view models for dashboard and list screens.
 * Independent of API contracts until backend integration.
 */

import type { DamageSeverity, FrameAnalysis, Report } from "./api";

export type AssessmentStatus = "complete" | "analyzing" | "pending";

export type SeverityLevel = 2 | 3 | 4 | 5;

export interface AssessmentRow {
  /** Display id (e.g. assessment_code or short video id). */
  id: string;
  /** Full `video_id` for routing to assessment details. */
  videoId: string;
  title: string;
  subtitle: string;
  location: string;
  type: string;
  severity: SeverityLevel;
  status: AssessmentStatus;
  date: string;
}

export interface DashboardStats {
  activeAssessments: { total: number; inProgress: number; pending: number };
  affectedBarangays: number;
  assessmentsToday: number;
  deltaFromYesterday: number;
  avgAssessmentTimeMinutes: number;
}

export interface SeverityDistributionItem {
  level: SeverityLevel;
  label: string;
  zones: number;
  pct: number;
}

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
  kind: "extract" | "vlm" | "report" | "system";
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  kind: "alert" | "assessment" | "report" | "system";
  unread?: boolean;
}

export interface ProfileSummary {
  initials: string;
  role: string;
  name: string;
  region: string;
  status: string;
  email: string;
  phone: string;
  team: string;
  clearance: string;
  missionsCompleted: number;
  responseReadinessPct: number;
}

export interface MapMarkerPoint {
  id: string;
  lat: number;
  lng: number;
  severity: SeverityLevel;
  label: string;
}

/** Extended marker for Map View (regional monitoring) */
export interface MapViewMarker extends MapMarkerPoint {
  assessmentId: string;
  hazardType: string;
  region: string;
}

export interface MapViewSummary {
  critical: number;
  severe: number;
  moderate: number;
  minor: number;
  roadsBlocked: number;
  lastUpdated: string;
}

export type MapSeverityFilter = "all" | SeverityLevel;

export interface ReportListItem {
  id: string;
  assessmentId: string;
  title: string;
  location: string;
  type: string;
  severity: SeverityLevel;
  status: AssessmentStatus;
  date: string;
  pages: number;
}

export interface SidebarIncident {
  id: string;
  videoId: string;
  location: string;
  timeAgo: string;
  severity: SeverityLevel;
  status: AssessmentStatus;
}

export const DASHBOARD_STATS: DashboardStats = {
  activeAssessments: { total: 3, inProgress: 2, pending: 1 },
  affectedBarangays: 47,
  assessmentsToday: 8,
  deltaFromYesterday: 3,
  avgAssessmentTimeMinutes: 24,
};

export const MOCK_ASSESSMENTS: AssessmentRow[] = [
  {
    id: "AE-2024-047",
    videoId: "AE-2024-047",
    title: "Butuan City Flooding",
    subtitle: "127 frames • 14 zones",
    location: "Butuan City, Agusan del Norte",
    type: "Flooding",
    severity: 4,
    status: "analyzing",
    date: "2024-04-10",
  },
  {
    id: "AE-2024-046",
    videoId: "AE-2024-046",
    title: "Las Nieves Landslide",
    subtitle: "84 frames • 6 zones",
    location: "Las Nieves, Agusan del Norte",
    type: "Landslide",
    severity: 3,
    status: "complete",
    date: "2024-04-10",
  },
  {
    id: "AE-2024-044",
    videoId: "AE-2024-044",
    title: "Bislig Flash Flood",
    subtitle: "56 frames • 4 zones",
    location: "Bislig, Surigao del Sur",
    type: "Flooding",
    severity: 2,
    status: "complete",
    date: "2024-04-09",
  },
  {
    id: "AE-2024-043",
    videoId: "AE-2024-043",
    title: "Bayugan Flooding",
    subtitle: "91 frames • 9 zones",
    location: "Bayugan, Agusan del Sur",
    type: "Flooding",
    severity: 4,
    status: "pending",
    date: "2024-04-09",
  },
  {
    id: "AE-2024-042",
    videoId: "AE-2024-042",
    title: "Dinagat Coastal Surge",
    subtitle: "72 frames • 5 zones",
    location: "Dinagat Islands",
    type: "Typhoon Damage",
    severity: 3,
    status: "complete",
    date: "2024-04-08",
  },
  {
    id: "AE-2024-041",
    videoId: "AE-2024-041",
    title: "Tandag Earthquake",
    subtitle: "140 frames • 11 zones",
    location: "Tandag, Surigao del Sur",
    type: "Earthquake",
    severity: 4,
    status: "complete",
    date: "2024-04-07",
  },
];

export const SEVERITY_DISTRIBUTION: SeverityDistributionItem[] = [
  { level: 5, label: "Critical", zones: 3, pct: 12 },
  { level: 4, label: "Severe", zones: 8, pct: 32 },
  { level: 3, label: "Moderate", zones: 9, pct: 36 },
  { level: 2, label: "Minor", zones: 5, pct: 20 },
];

export const ACTIVITY_FEED: ActivityItem[] = [
  {
    id: "1",
    text: "VLM analysis started — AE-2024-045, 127 frames queued",
    time: "3 min ago",
    kind: "vlm",
  },
  {
    id: "2",
    text: "Frame extraction complete — AE-2024-047",
    time: "8 min ago",
    kind: "extract",
  },
  {
    id: "3",
    text: "Report generated — AE-2024-046",
    time: "12 min ago",
    kind: "report",
  },
  {
    id: "4",
    text: "New upload received — Bayugan assessment",
    time: "18 min ago",
    kind: "system",
  },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "High-severity flooding alert",
    description: "Butuan corridor has a newly flagged severe incident requiring validation.",
    time: "2 min ago",
    kind: "alert",
    unread: true,
  },
  {
    id: "notif-2",
    title: "Assessment AE-2024-047 is analyzing",
    description: "Frame extraction has started and live analysis is currently in progress.",
    time: "8 min ago",
    kind: "assessment",
    unread: true,
  },
  {
    id: "notif-3",
    title: "Report generated for AE-2024-046",
    description: "Executive summary and recommendations are ready for export.",
    time: "12 min ago",
    kind: "report",
  },
  {
    id: "notif-4",
    title: "New upload received",
    description: "Bayugan drone footage was uploaded and queued for review.",
    time: "18 min ago",
    kind: "system",
  },
];

export const PROFILE_SUMMARY: ProfileSummary = {
  initials: "F",
  role: "Field Officer",
  name: "Fernando Reyes",
  region: "Caraga Region XIII",
  status: "Active deployment",
  email: "fernando.reyes@aegis.local",
  phone: "+63 917 555 1842",
  team: "Regional Rapid Assessment Unit",
  clearance: "Level 3",
  missionsCompleted: 128,
  responseReadinessPct: 94,
};

/** Caraga-ish region markers for dashboard map */
export const DASHBOARD_MAP_MARKERS: MapMarkerPoint[] = [
  { id: "m1", lat: 8.9475, lng: 125.5406, severity: 4, label: "Butuan" },
  { id: "m2", lat: 8.9778, lng: 125.4108, severity: 3, label: "Las Nieves" },
  { id: "m3", lat: 8.1582, lng: 126.2164, severity: 5, label: "Bislig" },
  { id: "m4", lat: 8.7143, lng: 125.7511, severity: 2, label: "Bayugan" },
];

export const SIDEBAR_INCIDENTS: SidebarIncident[] = [
  {
    id: "AE-2024-847",
    videoId: "AE-2024-847",
    location: "Butuan City — Agusan del Norte",
    timeAgo: "14 min ago",
    severity: 4,
    status: "analyzing",
  },
  {
    id: "AE-2024-845",
    videoId: "AE-2024-845",
    location: "Las Nieves — Agusan del Norte",
    timeAgo: "1 hr ago",
    severity: 3,
    status: "complete",
  },
  {
    id: "AE-2024-840",
    videoId: "AE-2024-840",
    location: "Bislig — Surigao del Sur",
    timeAgo: "3 hr ago",
    severity: 5,
    status: "complete",
  },
];

export const BOOKMARKED_AREAS = [
  "Brgy. Ambago, Butuan",
  "Agusan River corridor",
  "Dinagat coastal barangays",
];

/** Regional monitoring — Map View tab */
export const MAP_VIEW_SUMMARY: MapViewSummary = {
  critical: 1,
  severe: 2,
  moderate: 2,
  minor: 1,
  roadsBlocked: 5,
  lastUpdated: "Just now",
};

export const MAP_VIEW_MARKERS: MapViewMarker[] = [
  {
    id: "mv1",
    lat: 8.9475,
    lng: 125.5406,
    severity: 4,
    label: "Butuan — river corridor",
    assessmentId: "AE-2024-047",
    hazardType: "Flooding",
    region: "Butuan City",
  },
  {
    id: "mv2",
    lat: 8.9778,
    lng: 125.4108,
    severity: 3,
    label: "Las Nieves — slope",
    assessmentId: "AE-2024-046",
    hazardType: "Landslide",
    region: "Las Nieves",
  },
  {
    id: "mv3",
    lat: 8.1582,
    lng: 126.2164,
    severity: 5,
    label: "Bislig — coastal",
    assessmentId: "AE-2024-044",
    hazardType: "Flooding",
    region: "Bislig",
  },
  {
    id: "mv4",
    lat: 8.7143,
    lng: 125.7511,
    severity: 2,
    label: "Bayugan — peri-urban",
    assessmentId: "AE-2024-043",
    hazardType: "Flooding",
    region: "Bayugan",
  },
  {
    id: "mv5",
    lat: 9.7579,
    lng: 125.4708,
    severity: 3,
    label: "Dinagat — surge zone",
    assessmentId: "AE-2024-042",
    hazardType: "Typhoon Damage",
    region: "Dinagat Islands",
  },
  {
    id: "mv6",
    lat: 9.0782,
    lng: 126.1989,
    severity: 4,
    label: "Tandag — urban",
    assessmentId: "AE-2024-041",
    hazardType: "Earthquake",
    region: "Tandag",
  },
];

export const MOCK_REPORT_LIST: ReportListItem[] = [
  {
    id: "rep-047",
    assessmentId: "AE-2024-047",
    title: "Butuan City Flooding",
    location: "Butuan City, Agusan del Norte",
    type: "Flooding",
    severity: 4,
    status: "analyzing",
    date: "2024-04-10",
    pages: 12,
  },
  {
    id: "rep-046",
    assessmentId: "AE-2024-046",
    title: "Las Nieves Landslide",
    location: "Las Nieves, Agusan del Norte",
    type: "Landslide",
    severity: 3,
    status: "complete",
    date: "2024-04-10",
    pages: 8,
  },
  {
    id: "rep-044",
    assessmentId: "AE-2024-044",
    title: "Bislig Flash Flood",
    location: "Bislig, Surigao del Sur",
    type: "Flooding",
    severity: 2,
    status: "complete",
    date: "2024-04-09",
    pages: 6,
  },
  {
    id: "rep-043",
    assessmentId: "AE-2024-043",
    title: "Bayugan Flooding",
    location: "Bayugan, Agusan del Sur",
    type: "Flooding",
    severity: 4,
    status: "pending",
    date: "2024-04-09",
    pages: 10,
  },
  {
    id: "rep-042",
    assessmentId: "AE-2024-042",
    title: "Dinagat Coastal Surge",
    location: "Dinagat Islands",
    type: "Typhoon Damage",
    severity: 3,
    status: "complete",
    date: "2024-04-08",
    pages: 7,
  },
  {
    id: "rep-041",
    assessmentId: "AE-2024-041",
    title: "Tandag Earthquake",
    location: "Tandag, Surigao del Sur",
    type: "Earthquake",
    severity: 4,
    status: "complete",
    date: "2024-04-07",
    pages: 14,
  },
];

function reportForAssessment(
  assessmentId: string,
  locationLabel: string,
  sev: Report["overall_severity"],
  summary: string,
  lat: number,
  lng: number,
  created: string
): Report {
  return {
    report_id: `r_${assessmentId.replace(/-/g, "")}`,
    video_id: `vid_${assessmentId.replace(/-/g, "")}`,
    summary,
    overall_severity: sev,
    key_findings: [
      `${locationLabel}: multi-zone damage patterns consistent with recent imagery.`,
      "Access routes require verification; prioritize blocked segments for clearance.",
      "Population exposure estimated from frame analysis; field validation recommended.",
    ],
    recommendations: [
      "Deploy rapid assessment teams to highest-severity zones first.",
      "Stage relief along passable perimeter roads identified in the assessment.",
      "Share this report with cluster leads and municipal DRRM for coordination.",
    ],
    location: { lat, lng },
    created_at: created,
  };
}

/** Mock frames per assessment for the view screen */
function generateFrames(
  _assessmentId: string,
  baseLat: number,
  baseLng: number,
  count: number,
  hazardType: string
): FrameAnalysis[] {
  const severities: DamageSeverity[] = ["none", "minor", "moderate", "severe", "destroyed"];
  const hazardSets: Record<string, string[][]> = {
    Flooding: [
      ["flooding", "debris"],
      ["flooding", "access blockage"],
      ["flooding"],
      ["road damage", "flooding"],
      ["flooding", "structural collapse"],
    ],
    Landslide: [
      ["landslide", "debris"],
      ["slope instability"],
      ["road damage", "landslide"],
      ["debris"],
      ["landslide", "structural collapse"],
    ],
    "Typhoon Damage": [
      ["wind damage", "debris"],
      ["structural collapse"],
      ["flooding", "wind damage"],
      ["debris", "access blockage"],
      ["structural collapse", "flooding"],
    ],
    Earthquake: [
      ["structural collapse", "debris"],
      ["ground fracture"],
      ["structural collapse"],
      ["debris", "access blockage"],
      ["structural collapse", "trap"],
    ],
  };
  const hazards = hazardSets[hazardType] ?? hazardSets.Flooding;
  const descriptions: Record<string, string[]> = {
    Flooding: [
      "Standing water observed around residential structures.",
      "Road submerged with debris accumulation.",
      "Flood line visible on building facades.",
      "Bridge approach partially submerged.",
      "Deep water blocking main access route.",
    ],
    Landslide: [
      "Slope failure visible with debris flow onto road.",
      "Hillside erosion threatening structures below.",
      "Road partially obstructed by displaced soil.",
      "Retaining wall failure near residential area.",
      "Active debris flow channel identified.",
    ],
    "Typhoon Damage": [
      "Roof sections missing from multiple structures.",
      "Downed power lines across roadway.",
      "Coastal surge damage to shoreline properties.",
      "Wind-driven debris scattered across area.",
      "Structural wall collapse from wind loading.",
    ],
    Earthquake: [
      "Visible cracking in masonry building walls.",
      "Partial structural collapse of older buildings.",
      "Ground fracturing along road surface.",
      "Debris from collapsed facade blocking access.",
      "Building lean detected — possible foundation shift.",
    ],
  };
  const descs = descriptions[hazardType] ?? descriptions.Flooding;

  return Array.from({ length: count }, (_, i) => {
    const sevIdx = Math.floor(((i * 7 + 3) % count) / (count / severities.length));
    return {
      frame_index: i,
      timestamp_seconds: i * 2,
      severity: severities[Math.min(sevIdx, severities.length - 1)],
      description: descs[i % descs.length],
      detected_hazards: hazards[i % hazards.length],
      confidence: 0.72 + ((i * 3) % 20) / 100,
      location: {
        lat: baseLat + (Math.sin(i * 1.7) * 0.5 + 0.5) * 0.025 - 0.0125,
        lng: baseLng + (Math.sin((i + 2) * 1.7) * 0.5 + 0.5) * 0.035 - 0.0175,
      },
    };
  });
}

export const MOCK_FRAMES_BY_ASSESSMENT_ID: Record<string, FrameAnalysis[]> = {
  "AE-2024-047": generateFrames("AE-2024-047", 8.9475, 125.5406, 127, "Flooding"),
  "AE-2024-046": generateFrames("AE-2024-046", 8.9778, 125.4108, 84, "Landslide"),
  "AE-2024-044": generateFrames("AE-2024-044", 8.1582, 126.2164, 56, "Flooding"),
  "AE-2024-043": generateFrames("AE-2024-043", 8.7143, 125.7511, 91, "Flooding"),
  "AE-2024-042": generateFrames("AE-2024-042", 9.7579, 125.4708, 72, "Typhoon Damage"),
  "AE-2024-041": generateFrames("AE-2024-041", 9.0782, 126.1989, 140, "Earthquake"),
};

/** Full report payloads for preview (keyed by assessment id) */
export const MOCK_REPORT_BY_ASSESSMENT_ID: Record<string, Report> = {
  "AE-2024-047": reportForAssessment(
    "AE-2024-047",
    "Butuan City",
    "severe",
    "Widespread flooding along Agusan River with structural damage in low-lying barangays. Several access routes show standing water and debris.",
    8.9475,
    125.5406,
    "2024-04-10T14:22:00Z"
  ),
  "AE-2024-046": reportForAssessment(
    "AE-2024-046",
    "Las Nieves",
    "moderate",
    "Slope instability and debris flows affecting hillside communities. Roads partially obstructed in two segments.",
    8.9778,
    125.4108,
    "2024-04-10T11:05:00Z"
  ),
  "AE-2024-044": reportForAssessment(
    "AE-2024-044",
    "Bislig",
    "minor",
    "Localized flash flooding with limited structural impact. Drainage overflow observed in coastal barangays.",
    8.1582,
    126.2164,
    "2024-04-09T16:40:00Z"
  ),
  "AE-2024-043": reportForAssessment(
    "AE-2024-043",
    "Bayugan",
    "severe",
    "Riverine flooding with moderate-to-severe building damage in peri-urban clusters. Evacuation routes may be constrained.",
    8.7143,
    125.7511,
    "2024-04-09T09:15:00Z"
  ),
  "AE-2024-042": reportForAssessment(
    "AE-2024-042",
    "Dinagat Islands",
    "moderate",
    "Coastal surge and wind-driven damage along eastern shorelines. Fishing communities at elevated risk.",
    9.7579,
    125.4708,
    "2024-04-08T13:00:00Z"
  ),
  "AE-2024-041": reportForAssessment(
    "AE-2024-041",
    "Tandag",
    "severe",
    "Structural damage concentrated in older masonry buildings. Aftershock risk remains; inspect critical facilities.",
    9.0782,
    126.1989,
    "2024-04-07T08:30:00Z"
  ),
};
