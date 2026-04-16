import { Bell, ChevronRight, FileText, Radio, ShieldAlert } from "lucide-react";
import { MOCK_NOTIFICATIONS } from "../lib/mockData";

const notificationIcon = {
  alert: ShieldAlert,
  assessment: Radio,
  report: FileText,
  system: Bell,
} as const;

const notificationTone = {
  alert: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  assessment: "text-blue-200 bg-aegis-glow border-aegis-accent/25",
  report: "text-emerald-200 bg-emerald-500/10 border-emerald-500/20",
  system: "text-slate-200 bg-slate-500/10 border-slate-500/20",
} as const;

export default function NotificationsPage() {
  const unreadCount = MOCK_NOTIFICATIONS.filter((notification) => notification.unread).length;

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-title">Alert Center</p>
          <h1 className="mt-2 text-lg font-semibold text-white">Notifications</h1>
          <p className="mt-1 max-w-3xl text-[13px] text-slate-400">
            Review real-time alerts, assessment milestones, and platform activity across the
            active response region.
          </p>
        </div>
        <div className="rounded-2xl border border-aegis-border bg-aegis-surface2 px-4 py-3 text-right">
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Unread</div>
          <div className="mt-1 text-2xl font-semibold text-white">{unreadCount}</div>
        </div>
      </header>

      <section className="card overflow-hidden">
        <div className="card-header">
          <div>
            <p className="card-header-title">Latest Updates</p>
            <h2 className="mt-1 text-base font-semibold text-white">
              Mission-critical notifications
            </h2>
          </div>
        </div>
        <div className="space-y-3 p-4">
          {MOCK_NOTIFICATIONS.map((notification) => {
            const Icon = notificationIcon[notification.kind];
            return (
              <div
                key={notification.id}
                className="rounded-card border border-aegis-border bg-aegis-surface2/80 p-4"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${notificationTone[notification.kind]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[14px] font-semibold text-slate-100">
                        {notification.title}
                      </h3>
                      {notification.unread && (
                        <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-2 max-w-3xl text-[13px] leading-6 text-slate-400">
                      {notification.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-500">{notification.time}</span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-aegis-accent transition hover:text-blue-300"
                      >
                        Open context
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
