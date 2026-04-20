import { Suspense, lazy, useMemo } from "react";
import type { FrameAnalysis, Report } from "../lib/api";
import type { MapMarkerPoint } from "../lib/mockData";
import { Map, Marker, SeverityDot, FitBounds } from "./ui/map";

const ProvinceLayers = lazy(() => import("./ui/ProvinceLayers"));

function severityColor(level: number): string {
  if (level >= 5) return "#dc2626";
  if (level === 4) return "#f97316";
  if (level === 3) return "#eab308";
  return "#22c55e";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function severityLevelFromReport(sev: Report["overall_severity"]): number {
  switch (sev) {
    case "destroyed":
      return 5;
    case "severe":
      return 4;
    case "moderate":
      return 3;
    case "minor":
      return 2;
    case "none":
    default:
      return 1;
  }
}

function severityLevelFromFrame(sev: FrameAnalysis["severity"]): number {
  switch (sev) {
    case "destroyed":
      return 5;
    case "severe":
      return 4;
    case "moderate":
      return 3;
    case "minor":
      return 2;
    case "none":
    default:
      return 1;
  }
}

export interface MapFocusPoint {
  lat: number;
  lng: number;
  label?: string;
}

interface Props {
  report?: Report | null;
  /** Multi-point dashboard view; when non-empty, used instead of single report marker. */
  markers?: MapMarkerPoint[];
  /** Highlights one marker when syncing with a list selection (multi-marker mode only). */
  selectedMarkerId?: string | null;
  /** Per-frame analysis pins (streaming / workspace). */
  analysisFrames?: FrameAnalysis[];
  /** Highlights frame marker when syncing with feed / table / alerts. */
  selectedFrameIndex?: number | null;
  /** Pre-upload / form-selected location pin (hidden when report, markers, or frame pins are active). */
  focusPoint?: MapFocusPoint | null;
  /** Re-fit marker bounds when this changes (e.g. after clearing a temporary map focus). */
  fitBoundsRevision?: number;
  /** Show Caraga province boundary overlays. */
  showProvinces?: boolean;
}

function SelectedLocationPin() {
  return (
    <div
      className="h-4 w-4 rounded-full border-[3px] border-aegis-accent bg-transparent shadow-glow ring-2 ring-aegis-accent/35 ring-offset-2 ring-offset-[#0f172a]"
      aria-hidden
    />
  );
}

export default function MapView({
  report,
  markers,
  selectedMarkerId,
  analysisFrames,
  selectedFrameIndex,
  focusPoint = null,
  fitBoundsRevision = 0,
  showProvinces = true,
}: Props) {
  const multiPoints = useMemo(
    () => (markers?.length ? markers.map((m) => [m.lng, m.lat] as [number, number]) : []),
    [markers]
  );

  const framePoints = useMemo(() => {
    if (!analysisFrames?.length) return [];
    return analysisFrames
      .filter((f) => f.location)
      .map((f) => [f.location!.lng, f.location!.lat] as [number, number]);
  }, [analysisFrames]);

  const showMulti = Boolean(markers && markers.length > 0);
  const showFrames = Boolean(analysisFrames && analysisFrames.length > 0 && framePoints.length > 0);

  /** Pan/zoom to bookmark or form focus even when cluster markers are shown. */
  const focusActive = Boolean(focusPoint && !report?.location);
  /** Selection/bookmark pin: show with multi-markers (dashboard bookmarks, map list focus). Omit when frame pins own the map. */
  const showFocusPin = focusActive && !showFrames;

  const center: [number, number] = report?.location
    ? [report.location.lng, report.location.lat]
    : framePoints[0]
      ? framePoints[0]
      : focusActive && focusPoint
        ? [focusPoint.lng, focusPoint.lat]
        : multiPoints[0]
          ? multiPoints[0]
          : [125.5, 8.5];
  const zoom =
    focusActive && focusPoint
      ? 13
      : markers?.length || framePoints.length
        ? 8
        : report?.location
          ? 14
          : 7;

  return (
    <Map center={center} zoom={zoom} className="h-full min-h-0">
      {showProvinces && (
        <Suspense fallback={null}>
          <ProvinceLayers />
        </Suspense>
      )}
      {showMulti && markers && (
        <>
          {!focusActive && (
            <FitBounds points={multiPoints} revision={fitBoundsRevision} />
          )}
          {markers.map((m) => (
            <Marker
              key={m.id}
              lngLat={[m.lng, m.lat]}
              popupHtml={`<strong>${escapeHtml(m.label)}</strong><br/>SEV ${m.severity}`}
            >
              <SeverityDot
                color={severityColor(m.severity)}
                selected={selectedMarkerId != null && m.id === selectedMarkerId}
              />
            </Marker>
          ))}
        </>
      )}
      {!showMulti && showFrames && analysisFrames && (
        <>
          <FitBounds points={framePoints} />
          {analysisFrames
            .filter((f) => f.location)
            .map((f) => (
              <Marker
                key={f.frame_index}
                lngLat={[f.location!.lng, f.location!.lat]}
                popupHtml={`<strong>Frame ${f.frame_index}</strong><br/>${escapeHtml(f.severity)}<br/>${escapeHtml(f.description.slice(0, 120))}`}
              >
                <SeverityDot
                  color={severityColor(severityLevelFromFrame(f.severity))}
                  selected={selectedFrameIndex != null && f.frame_index === selectedFrameIndex}
                />
              </Marker>
            ))}
        </>
      )}
      {!showMulti && !showFrames && report?.location && (
        <Marker
          lngLat={[report.location.lng, report.location.lat]}
          popupHtml={`<strong>Severity:</strong> ${escapeHtml(String(report.overall_severity))}<br/>${escapeHtml(report.summary)}`}
        >
          <SeverityDot color={severityColor(severityLevelFromReport(report.overall_severity))} />
        </Marker>
      )}
      {showFocusPin && focusPoint && (
        <Marker
          lngLat={[focusPoint.lng, focusPoint.lat]}
          popupHtml={`<strong>${escapeHtml(focusPoint.label || "Selected location")}</strong>`}
        >
          <SelectedLocationPin />
        </Marker>
      )}
    </Map>
  );
}
