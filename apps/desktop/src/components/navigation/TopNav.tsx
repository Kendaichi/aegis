import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  FileText,
  Radio,
  ShieldAlert,
  UserCircle2,
} from "lucide-react";
import type { AppView } from "../layout/AppShell";
import { MOCK_NOTIFICATIONS } from "../../lib/mockData";
import AegisLogo from "../ui/AegisLogo";

interface Props {
  title: string;
  subtitle: string;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

const notificationIcon = {
  alert: ShieldAlert,
  assessment: Radio,
  report: FileText,
  system: Bell,
} as const;

export default function TopNav({ title, subtitle, activeView, onNavigate }: Props) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(
    () => MOCK_NOTIFICATIONS.filter((notification) => notification.unread).length,
    []
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    if (notificationsOpen) {
      window.addEventListener("mousedown", handlePointerDown);
    }

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [notificationsOpen]);

  return (
    <header className="relative z-20 flex h-12 shrink-0 items-center justify-between border-b border-aegis-border bg-aegis-surface/70 px-5 backdrop-blur-xl">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-aegis-border bg-aegis-surface2 p-1">
            <span className="sr-only">AEGIS</span>
            <AegisLogo className="h-7 w-7 object-contain" alt="" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{title}</p>
            <p className="truncate text-[11px] text-slate-500">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onNavigate("notifications")}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-300 transition hover:bg-amber-500/15"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          {unreadCount} Active Alerts
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-aegis-border bg-aegis-surface2 text-slate-400 transition hover:bg-white/5 hover:text-white ${
              activeView === "notifications" ? "text-white shadow-glow" : ""
            }`}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-11 w-[22rem] rounded-card border border-aegis-border bg-aegis-surface p-3 shadow-card backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3 border-b border-aegis-border pb-3">
                <div>
                  <p className="text-sm font-semibold text-white">Notifications</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {unreadCount} unread alert{unreadCount === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(false);
                    onNavigate("notifications");
                  }}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-aegis-accent transition hover:text-blue-300"
                >
                  See all
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {MOCK_NOTIFICATIONS.slice(0, 3).map((notification) => {
                  const Icon = notificationIcon[notification.kind];
                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        onNavigate("notifications");
                      }}
                      className="flex w-full items-start gap-3 rounded-2xl border border-aegis-border bg-aegis-surface2/80 px-3 py-3 text-left transition hover:bg-white/[0.03]"
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-aegis-glow text-aegis-accent">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-medium text-slate-100">
                            {notification.title}
                          </span>
                          {notification.unread && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                          )}
                        </span>
                        <span className="mt-1 block text-[12px] leading-5 text-slate-400">
                          {notification.description}
                        </span>
                        <span className="mt-2 block text-[11px] text-slate-500">
                          {notification.time}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onNavigate("profile")}
          className={`flex items-center gap-2 rounded-2xl border border-aegis-border bg-aegis-surface2 px-2 py-1 transition hover:bg-white/5 ${
            activeView === "profile" ? "shadow-glow" : ""
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-aegis-accent text-xs font-semibold text-white shadow-glow">
            F
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-100">
              Field Officer
              <UserCircle2 className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Caraga Region XIII
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
