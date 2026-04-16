import { Activity, Route } from "lucide-react";
import {
  MOCK_ASSESSMENTS,
  type MapViewMarker,
  type MapViewSummary,
} from "../../lib/mockData";
import { SeverityBadge, StatusBadge } from "../ui/Badges";

interface Props {
  summary: MapViewSummary;
  incidents: MapViewMarker[];
  selectedId: string | null;
  onSelect: (markerId: string) => void;
}

function statusForAssessment(assessmentId: string) {
  return MOCK_ASSESSMENTS.find((assessment) => assessment.id === assessmentId)?.status;
}

export default function MapContextPanel({
  summary,
  incidents,
  selectedId,
  onSelect,
}: Props) {
  return (
    <aside className="flex h-full min-h-0 w-full max-w-[340px] shrink-0 flex-col border-l border-aegis-border bg-aegis-surface/65 backdrop-blur-xl">
      <div className="border-b border-aegis-border p-4">
        <p className="section-title">Active Monitoring</p>
        <p className="mt-2 text-[13px] text-slate-400">Last updated: {summary.lastUpdated}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 border-b border-aegis-border p-4">
        <div className="rounded-2xl border border-aegis-border bg-aegis-surface2 px-3 py-3 text-center">
          <div className="text-2xl font-semibold text-red-500">{summary.critical}</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Critical
          </div>
        </div>
        <div className="rounded-2xl border border-aegis-border bg-aegis-surface2 px-3 py-3 text-center">
          <div className="text-2xl font-semibold text-orange-400">{summary.severe}</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Severe
          </div>
        </div>
        <div className="rounded-2xl border border-aegis-border bg-aegis-surface2 px-3 py-3 text-center">
          <div className="text-2xl font-semibold text-amber-400">{summary.moderate}</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Moderate
          </div>
        </div>
        <div className="rounded-2xl border border-aegis-border bg-aegis-surface2 px-3 py-3 text-center">
          <div className="text-2xl font-semibold text-emerald-400">{summary.minor}</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">Minor</div>
        </div>
      </div>

      <div className="border-b border-aegis-border p-4">
        <div className="flex items-center gap-2 text-[13px] text-slate-300">
          <Route className="h-4 w-4 text-aegis-accent" />
          <span>
            <span className="font-semibold text-white">{summary.roadsBlocked}</span> road segments
            flagged as blocked or caution.
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-aegis-accent" />
          <h3 className="section-title">Incidents On Map</h3>
        </div>
        <ul className="space-y-3">
          {incidents.map((incident) => {
            const status = statusForAssessment(incident.assessmentId);
            const selected = selectedId === incident.id;

            return (
              <li key={incident.id}>
                <button
                  type="button"
                  onClick={() => onSelect(incident.id)}
                  className={`w-full rounded-card border p-3 text-left shadow-card transition ${
                    selected
                      ? "border-aegis-accent/40 bg-aegis-glow ring-1 ring-aegis-accent/30"
                      : "border-aegis-border bg-aegis-surface2/80 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[11px] text-aegis-accent">
                      {incident.assessmentId}
                    </span>
                    <SeverityBadge level={incident.severity} />
                  </div>
                  <p className="mt-2 text-[13px] font-medium leading-6 text-slate-100">
                    {incident.label}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {incident.region} - {incident.hazardType}
                  </p>
                  {status && (
                    <div className="mt-3">
                      <StatusBadge status={status} />
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
