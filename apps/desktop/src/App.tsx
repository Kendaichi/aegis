import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import AssessmentsPage from "./pages/AssessmentsPage";
import MapViewPage from "./pages/MapViewPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import ReportsPage from "./pages/ReportsPage";
import AssessmentsWorkspacePage from "./pages/AssessmentsWorkspacePage";

export default function App() {
  return (
    <AppShell>
      {({ activeView, workspaceOpen, openWorkspace, closeWorkspace }) => {
        if (workspaceOpen) {
          return <AssessmentsWorkspacePage onBack={closeWorkspace} />;
        }

        switch (activeView) {
          case "dashboard":
            return <DashboardPage />;
          case "assessments":
            return <AssessmentsPage onNewAssessment={openWorkspace} />;
          case "map":
            return <MapViewPage />;
          case "reports":
            return <ReportsPage />;
          case "notifications":
            return <NotificationsPage />;
          case "profile":
            return <ProfilePage onOpenWorkspace={openWorkspace} />;
          case "settings":
            return (
              <div className="flex h-full flex-col gap-6 overflow-auto p-6">
                <section className="card max-w-3xl p-6">
                  <p className="section-title">Control Center</p>
                  <h1 className="mt-3 text-lg font-semibold text-white">
                    Settings are being refined
                  </h1>
                  <p className="mt-2 max-w-2xl text-[13px] leading-6 text-slate-400">
                    This placeholder keeps the new navigation complete while the operator,
                    notification, and deployment controls are still being wired into the desktop
                    client.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button type="button" onClick={openWorkspace} className="button-primary">
                      Launch Workspace
                    </button>
                    <button type="button" className="button-secondary">
                      Notification Rules
                    </button>
                  </div>
                </section>
              </div>
            );
          default:
            return null;
        }
      }}
    </AppShell>
  );
}
