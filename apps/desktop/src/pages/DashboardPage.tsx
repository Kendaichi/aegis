import { useEffect, useRef, useState } from "react";
import { ChevronRight, Maximize2 } from "lucide-react";
import MapView from "../components/Map";
import type { DashboardMapFocus } from "../components/layout/AppShell";
import StatsCards from "../components/dashboard/StatsCards";
import SeverityDistribution from "../components/dashboard/SeverityDistribution";
import RecentAssessments from "../components/dashboard/RecentAssessments";
import LiveActivity from "../components/dashboard/LiveActivity";
import { DASHBOARD_MAP_MARKERS } from "../lib/mockData";

interface Props {
  mapFocus?: DashboardMapFocus;
  onViewAssessment?: (videoId: string) => void;
}

export default function DashboardPage({ mapFocus = null, onViewAssessment }: Props) {
  const mapSectionRef = useRef<HTMLElement>(null);
  const [mapFocused, setMapFocused] = useState(false);

  useEffect(() => {
    if (!mapFocused) return;
    const timeoutId = window.setTimeout(() => setMapFocused(false), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [mapFocused]);

  useEffect(() => {
    if (!mapFocus) return;
    // Bookmark fly-to is handled inside Map only; avoid scrollIntoView here so the dashboard layout doesn't jump.
    setMapFocused(true);
  }, [mapFocus]);

  function handleFocusMap() {
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMapFocused(true);
  }

  async function handleFullscreen() {
    const target = mapSectionRef.current;
    if (!target) return;

    if (document.fullscreenElement === target) {
      await document.exitFullscreen();
      return;
    }

    await target.requestFullscreen();
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-title">Regional Overview</p>
          <h1 className="mt-2 text-lg font-semibold text-white">Caraga response network</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-slate-400">
            Monitor active incidents, prioritize high-severity zones, and keep rapid assessment
            teams aligned from a single operational surface.
          </p>
        </div>
        <button type="button" onClick={handleFocusMap} className="button-secondary">
          <Maximize2 className="h-4 w-4" />
          Focus Map
        </button>
      </div>

      <StatsCards />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="flex min-h-0 flex-col gap-4 xl:col-span-8">
          <section
            ref={mapSectionRef}
            className={`card flex min-h-[24rem] flex-1 flex-col overflow-hidden transition ${
              mapFocused ? "ring-2 ring-aegis-accent/40 shadow-glow" : ""
            }`}
          >
            <div className="card-header">
              <div>
                <p className="card-header-title">Live Monitoring</p>
                <h2 className="mt-1 text-base font-semibold text-white">
                  Caraga Region Active Coverage
                </h2>
                <p className="mt-1 text-[12px] text-slate-500">Last synchronized just now</p>
              </div>
              <button
                type="button"
                onClick={() => void handleFullscreen()}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-aegis-accent transition hover:text-blue-300"
              >
                Fullscreen
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 p-3">
              <div className="h-full overflow-hidden rounded-[1.25rem] border border-aegis-border bg-aegis-surface2">
                <MapView markers={DASHBOARD_MAP_MARKERS} focusPoint={mapFocus} />
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

          <RecentAssessments className="shrink-0" onViewAssessment={onViewAssessment} />
        </div>

        <div className="flex min-h-0 flex-col gap-4 xl:col-span-4">
          <SeverityDistribution />
          <div className="min-h-[18rem] flex-1">
            <LiveActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
