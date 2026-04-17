import { Layers, Maximize2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import MapView from "../components/Map";
import MapContextPanel from "../components/map/MapContextPanel";
import type {
  AssessmentStatus,
  MapSeverityFilter,
  MapViewMarker,
  MapViewSummary,
} from "../lib/mockData";
import {
  fetchMapMarkers,
  fetchMarkerStatusMap,
  subscribeToQueueUpdates,
  summarizeMarkers,
} from "../lib/supabaseQueries";

const SEVERITY_FILTERS: Array<{ id: MapSeverityFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: 5, label: "SEV 5" },
  { id: 4, label: "SEV 4" },
  { id: 3, label: "SEV 3" },
  { id: 2, label: "SEV 2" },
];

const EMPTY_SUMMARY: MapViewSummary = {
  critical: 0,
  severe: 0,
  moderate: 0,
  minor: 0,
  roadsBlocked: 0,
  lastUpdated: "—",
};

export default function MapViewPage() {
  const [severityFilter, setSeverityFilter] = useState<MapSeverityFilter>("all");
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [showProvinces, setShowProvinces] = useState(true);

  const [markers, setMarkers] = useState<MapViewMarker[]>([]);
  const [summary, setSummary] = useState<MapViewSummary>(EMPTY_SUMMARY);
  const [statusByMarker, setStatusByMarker] = useState<Record<string, AssessmentStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [nextMarkers, nextStatuses] = await Promise.all([
          fetchMapMarkers(),
          fetchMarkerStatusMap(),
        ]);
        if (cancelled) return;
        setMarkers(nextMarkers);
        setSummary(summarizeMarkers(nextMarkers));
        setStatusByMarker(nextStatuses);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load map data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    const unsubscribe = subscribeToQueueUpdates(() => {
      void load();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const filteredMarkers = useMemo(() => {
    if (severityFilter === "all") return markers;
    return markers.filter((m) => m.severity === severityFilter);
  }, [markers, severityFilter]);

  useEffect(() => {
    if (!filteredMarkers.length) {
      setSelectedMarkerId(null);
      return;
    }
    if (!selectedMarkerId || !filteredMarkers.some((m) => m.id === selectedMarkerId)) {
      setSelectedMarkerId(filteredMarkers[0].id);
    }
  }, [filteredMarkers, selectedMarkerId]);

  const setFilter = useCallback((value: MapSeverityFilter) => {
    setSeverityFilter(value);
  }, []);

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-title">Spatial Monitoring</p>
          <h1 className="mt-2 text-lg font-semibold text-white">Regional incident map</h1>
          <p className="mt-1 text-[13px] text-slate-400">
            Filter incidents by severity and inspect context-rich cards alongside the live map.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SEVERITY_FILTERS.map(({ id, label }) => (
            <button
              key={String(id)}
              type="button"
              onClick={() => setFilter(id)}
              className={`filter-pill ${severityFilter === id ? "filter-pill-active" : ""}`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowProvinces((v) => !v)}
            className={`button-secondary ${showProvinces ? "ring-1 ring-blue-500" : ""}`}
          >
            <Layers className="h-4 w-4" />
            Provinces
          </button>
          <button type="button" className="button-secondary">
            <Maximize2 className="h-4 w-4" />
            Fullscreen
          </button>
        </div>
      </div>

      {error && (
        <div className="card border border-red-500/30 bg-red-500/10 p-4 text-[13px] text-red-200">
          {error}
        </div>
      )}

      <div className="card flex min-h-0 flex-1 overflow-hidden p-0">
        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="card-header">
            <div>
              <p className="card-header-title">Coverage</p>
              <h2 className="mt-1 text-base font-semibold text-white">Caraga Region</h2>
              <p className="mt-1 text-[12px] text-slate-500">
                {loading
                  ? "Loading incidents..."
                  : `${filteredMarkers.length} incident${filteredMarkers.length === 1 ? "" : "s"} shown`}
              </p>
            </div>
          </div>
          <div className="min-h-0 flex-1 p-3">
            <div className="h-full overflow-hidden rounded-[1.25rem] border border-aegis-border bg-aegis-surface2">
              <MapView markers={filteredMarkers} selectedMarkerId={selectedMarkerId} showProvinces={showProvinces} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 border-t border-aegis-border px-4 py-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
              Critical (5)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              Severe (4)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Moderate (3)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Minor (1-2)
            </span>
          </div>
        </section>

        <MapContextPanel
          summary={summary}
          incidents={filteredMarkers}
          selectedId={selectedMarkerId}
          onSelect={setSelectedMarkerId}
          statusByMarkerId={statusByMarker}
        />
      </div>
    </div>
  );
}
