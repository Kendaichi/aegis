import { Maximize2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import MapView from "../components/Map";
import MapContextPanel from "../components/map/MapContextPanel";
import {
  MAP_VIEW_MARKERS,
  MAP_VIEW_SUMMARY,
  type MapSeverityFilter,
} from "../lib/mockData";

const SEVERITY_FILTERS: Array<{ id: MapSeverityFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: 5, label: "SEV 5" },
  { id: 4, label: "SEV 4" },
  { id: 3, label: "SEV 3" },
  { id: 2, label: "SEV 2" },
];

export default function MapViewPage() {
  const [severityFilter, setSeverityFilter] = useState<MapSeverityFilter>("all");
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(
    MAP_VIEW_MARKERS[0]?.id ?? null
  );

  const filteredMarkers = useMemo(() => {
    if (severityFilter === "all") return MAP_VIEW_MARKERS;
    return MAP_VIEW_MARKERS.filter((m) => m.severity === severityFilter);
  }, [severityFilter]);

  const setFilter = useCallback((value: MapSeverityFilter) => {
    setSeverityFilter(value);
    const next =
      value === "all" ? MAP_VIEW_MARKERS : MAP_VIEW_MARKERS.filter((m) => m.severity === value);
    setSelectedMarkerId(next[0]?.id ?? null);
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
          <button type="button" className="button-secondary">
            <Maximize2 className="h-4 w-4" />
            Fullscreen
          </button>
        </div>
      </div>

      <div className="card flex min-h-0 flex-1 overflow-hidden p-0">
        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="card-header">
            <div>
              <p className="card-header-title">Coverage</p>
              <h2 className="mt-1 text-base font-semibold text-white">Caraga Region</h2>
              <p className="mt-1 text-[12px] text-slate-500">
                {filteredMarkers.length} incident{filteredMarkers.length === 1 ? "" : "s"} shown
              </p>
            </div>
          </div>
          <div className="min-h-0 flex-1 p-3">
            <div className="h-full overflow-hidden rounded-[1.25rem] border border-aegis-border bg-aegis-surface2">
              <MapView markers={filteredMarkers} selectedMarkerId={selectedMarkerId} />
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
          summary={MAP_VIEW_SUMMARY}
          incidents={filteredMarkers}
          selectedId={selectedMarkerId}
          onSelect={setSelectedMarkerId}
        />
      </div>
    </div>
  );
}
