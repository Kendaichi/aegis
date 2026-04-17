import { useMemo, useState, type ReactNode } from "react";
import SideNav from "../navigation/SideNav";
import TopNav from "../navigation/TopNav";

export type NavView = "dashboard" | "assessments" | "map" | "reports" | "settings";
export type AppView = NavView | "notifications" | "profile";

interface AppShellRenderProps {
  activeView: AppView;
  workspaceOpen: boolean;
  openWorkspace: () => void;
  closeWorkspace: () => void;
  navigate: (view: AppView) => void;
}

interface Props {
  children: (props: AppShellRenderProps) => ReactNode;
}

export default function AppShell({ children }: Props) {
  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  function navigate(view: AppView) {
    setWorkspaceOpen(false);
    setActiveView(view);
  }

  const topNavMeta = useMemo(() => {
    if (workspaceOpen) {
      return {
        title: "Assessment Workspace",
        subtitle: "Live ingest, frame analysis, map context, and AI-assisted review",
      };
    }

    switch (activeView) {
      case "dashboard":
        return {
          title: "Operations Dashboard",
          subtitle: "Regional monitoring, active incidents, and live platform health",
        };
      case "assessments":
        return {
          title: "Assessments",
          subtitle: "Search, filter, and launch drone-based damage assessments",
        };
      case "map":
        return {
          title: "Map View",
          subtitle: "Spatial overview of active assessments across Caraga Region XIII",
        };
      case "reports":
        return {
          title: "Reports",
          subtitle: "Preview generated reports and export field-ready summaries",
        };
      case "settings":
        return {
          title: "Settings",
          subtitle: "Configure operators, notifications, and deployment preferences",
        };
      case "notifications":
        return {
          title: "Notifications",
          subtitle: "Review active alerts, new ingest activity, and assessment milestones",
        };
      case "profile":
        return {
          title: "Profile",
          subtitle: "Operator identity, deployment region, and response readiness details",
        };
      default:
        return {
          title: "AEGIS",
          subtitle: "Autonomous emergency geospatial intelligence system",
        };
    }
  }, [activeView, workspaceOpen]);

  return (
    <div className="flex h-full bg-aegis-bg text-slate-100">
      <SideNav
        active={activeView === "notifications" || activeView === "profile" ? "dashboard" : activeView}
        onNavigate={navigate}
        onUploadClick={() => setWorkspaceOpen(true)}
        showDashboardPanel={!workspaceOpen && activeView === "dashboard"}
      />
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.9),transparent_40%)]" />
        <div className="relative flex h-full min-h-0 flex-col">
          <TopNav
            title={topNavMeta.title}
            subtitle={topNavMeta.subtitle}
            onNavigate={navigate}
            activeView={activeView}
          />
          <main className="min-h-0 flex-1 overflow-hidden">
            {children({
              activeView,
              workspaceOpen,
              openWorkspace: () => setWorkspaceOpen(true),
              closeWorkspace: () => setWorkspaceOpen(false),
              navigate,
            })}
          </main>
        </div>
      </div>
    </div>
  );
}
