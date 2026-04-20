import {
  BarChart3,
  Bookmark,
  FileText,
  LayoutDashboard,
  Map,
  MapPin,
  Plus,
  Settings,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  type SidebarIncident,
  type AssessmentStatus,
} from "../../lib/mockData";
import {
  type BookmarkedArea,
  fetchActiveIncidents,
  fetchBookmarkedAreas,
  subscribeToQueueUpdates,
} from "../../lib/supabaseQueries";
import type { NavView } from "../layout/AppShell";
import { SeverityBadge } from "../ui/Badges";

interface Props {
  active: NavView;
  onNavigate: (view: NavView) => void;
  onUploadClick: () => void;
  showDashboardPanel?: boolean;
  onViewAssessment?: (videoId: string) => void;
  onFocusArea?: (area: BookmarkedArea) => void;
}

function IncidentRow({
  row,
  onSelect,
}: {
  row: SidebarIncident;
  onSelect?: (videoId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(row.videoId)}
      className="w-full rounded-card border border-aegis-border bg-aegis-surface2/90 p-3 text-left shadow-card transition hover:border-aegis-accent/30 hover:bg-aegis-surface2"
      aria-label={`Open assessment ${row.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] text-aegis-accent">{row.id}</span>
        <SeverityBadge level={row.severity} />
      </div>
      <p className="mt-2 text-[13px] leading-snug text-slate-200">{row.location}</p>
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>{row.timeAgo}</span>
        <StatusMini status={row.status} />
      </div>
    </button>
  );
}

function StatusMini({ status }: { status: AssessmentStatus }) {
  if (status === "analyzing") {
    return (
      <span className="flex items-center gap-1 text-aegis-accent">
        <span className="inline-block h-1.5 w-1.5 animate-spin rounded-full border border-aegis-accent border-t-transparent" />
        Analyzing...
      </span>
    );
  }
  if (status === "complete") {
    return <span className="text-emerald-400">Complete</span>;
  }
  return <span className="text-slate-400">Pending</span>;
}

const primaryItems: Array<{
  id: NavView;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "assessments", label: "Assessments", icon: FileText },
  { id: "map", label: "Map", icon: Map },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

function useActiveIncidents(enabled: boolean): {
  incidents: SidebarIncident[];
  loading: boolean;
} {
  const [incidents, setIncidents] = useState<SidebarIncident[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchActiveIncidents(3);
        if (!cancelled) setIncidents(next);
      } catch {
        if (!cancelled) setIncidents([]);
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
  }, [enabled]);

  return { incidents, loading };
}

function useBookmarkedAreas(enabled: boolean): {
  areas: BookmarkedArea[];
  loading: boolean;
} {
  const [areas, setAreas] = useState<BookmarkedArea[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchBookmarkedAreas();
        if (!cancelled) setAreas(next);
      } catch {
        if (!cancelled) setAreas([]);
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
  }, [enabled]);

  return { areas, loading };
}

export default function SideNav({
  active,
  onNavigate,
  onUploadClick,
  showDashboardPanel = false,
  onViewAssessment,
  onFocusArea,
}: Props) {
  const { incidents, loading } = useActiveIncidents(showDashboardPanel);
  const { areas: bookmarkedAreas, loading: bookmarksLoading } =
    useBookmarkedAreas(showDashboardPanel);

  return (
    <div className="flex h-full shrink-0">
      <aside className="flex w-20 shrink-0 flex-col items-center border-r border-aegis-border bg-aegis-surface/70 px-3 py-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-aegis-border bg-aegis-surface2 text-sm font-semibold tracking-[0.3em] text-white shadow-card transition hover:bg-white/5"
          title="AEGIS Dashboard"
          aria-label="Go to dashboard"
        >
          AG
        </button>

        <nav className="flex w-full flex-1 flex-col items-center gap-2">
          {primaryItems.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                title={label}
                aria-label={label}
                className={`relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                  isActive
                    ? "border-aegis-accent/40 bg-aegis-glow text-white shadow-glow"
                    : "border-transparent text-slate-500 hover:border-aegis-border hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 h-8 w-0.5 rounded-full bg-aegis-accent" />
                )}
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onUploadClick}
            title="New assessment"
            aria-label="New assessment"
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-aegis-accent text-white shadow-glow transition hover:brightness-110"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onUploadClick}
            title="Upload drone footage"
            aria-label="Upload drone footage"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-aegis-border bg-aegis-surface2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <Upload className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate("settings")}
            title="Settings"
            aria-label="Settings"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
              active === "settings"
                ? "border-aegis-accent/40 bg-aegis-glow text-white shadow-glow"
                : "border-aegis-border bg-aegis-surface2 text-slate-500 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {showDashboardPanel && (
        <aside className="flex w-[320px] shrink-0 flex-col gap-5 border-r border-aegis-border bg-aegis-surface/45 p-4 backdrop-blur-xl">
          <div className="card overflow-hidden">
            <div className="card-header">
              <div>
                <p className="card-header-title">Rapid Actions</p>
                <p className="mt-1 text-[12px] text-slate-400">
                  Launch a new ingest or jump into the most urgent incidents.
                </p>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <button type="button" onClick={onUploadClick} className="button-primary w-full">
                <Plus className="h-4 w-4" />
                New Assessment
              </button>
              <button type="button" onClick={onUploadClick} className="button-secondary w-full">
                <Upload className="h-4 w-4" />
                Upload Drone Footage
              </button>
            </div>
          </div>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-aegis-accent" />
              <h2 className="section-title">Active Incidents</h2>
            </div>
            <div className="flex flex-col gap-3">
              {loading && incidents.length === 0 && (
                <p className="rounded-card border border-dashed border-aegis-border bg-aegis-surface2/60 p-3 text-[12px] text-slate-500">
                  Loading live queue...
                </p>
              )}
              {!loading && incidents.length === 0 && (
                <p className="rounded-card border border-dashed border-aegis-border bg-aegis-surface2/60 p-3 text-[12px] text-slate-500">
                  No active incidents in the queue.
                </p>
              )}
              {incidents.map((row) => (
                <IncidentRow key={row.videoId} row={row} onSelect={onViewAssessment} />
              ))}
            </div>
          </section>

          <section className="card p-4">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-aegis-accent" />
              <h2 className="section-title">Bookmarked Areas</h2>
            </div>
            {bookmarksLoading && bookmarkedAreas.length === 0 && (
              <p className="rounded-2xl border border-dashed border-aegis-border bg-aegis-surface2/60 px-3 py-2 text-[12px] text-slate-500">
                Loading areas...
              </p>
            )}
            {!bookmarksLoading && bookmarkedAreas.length === 0 && (
              <p className="rounded-2xl border border-dashed border-aegis-border bg-aegis-surface2/60 px-3 py-2 text-[12px] text-slate-500">
                No tracked areas yet — upload footage to populate.
              </p>
            )}
            {bookmarkedAreas.length > 0 && (
              <ul className="space-y-2">
                {bookmarkedAreas.map((area) => (
                  <li key={area.name}>
                    <button
                      type="button"
                      onClick={() => onFocusArea?.(area)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-aegis-border bg-aegis-surface2/80 px-3 py-2 text-left text-[13px] text-slate-300 transition hover:border-aegis-accent/30 hover:bg-aegis-surface2"
                      aria-label={`Show ${area.name} on live map`}
                    >
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-aegis-glow text-aegis-accent">
                        <MapPin className="h-4 w-4" />
                      </span>
                      {area.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      )}
    </div>
  );
}
