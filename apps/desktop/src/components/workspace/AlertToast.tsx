import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowUpRight, TriangleAlert, X } from "lucide-react";
import type { DamageSeverity, FrameAnalysis } from "../../lib/api";

export interface AlertItem {
  id: string;
  frameIndex: number;
  severity: DamageSeverity;
  description: string;
  durationMs: number;
  frame?: FrameAnalysis;
}

type ShowAlertInput = {
  frameIndex: number;
  severity: DamageSeverity;
  description: string;
  durationMs?: number;
  frame?: FrameAnalysis;
};

type AlertContextValue = {
  showAlert: (input: ShowAlertInput) => void;
  dismiss: (id: string) => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

export function useAlert(): AlertContextValue {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return ctx;
}

function severityMeta(severity: DamageSeverity) {
  switch (severity) {
    case "destroyed":
      return { label: "Critical", bar: "bg-red-700", tone: "text-red-100" };
    case "severe":
      return { label: "Severe", bar: "bg-red-500", tone: "text-red-100" };
    case "moderate":
      return { label: "Moderate", bar: "bg-orange-500", tone: "text-orange-100" };
    case "minor":
      return { label: "Minor", bar: "bg-amber-500", tone: "text-amber-100" };
    case "none":
    default:
      return { label: "Info", bar: "bg-slate-500", tone: "text-slate-100" };
  }
}

function ToastRow({
  alert,
  onDismiss,
  onJump,
}: {
  alert: AlertItem;
  onDismiss: () => void;
  onJump: () => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const meta = severityMeta(alert.severity);

  useEffect(() => {
    const element = barRef.current;
    if (!element) return;
    element.style.width = "100%";
    element.style.transition = `width ${alert.durationMs}ms linear`;
    requestAnimationFrame(() => {
      element.style.width = "0%";
    });
  }, [alert.durationMs, alert.id]);

  return (
    <div
      role="alert"
      className="pointer-events-auto relative overflow-hidden rounded-card border border-aegis-border bg-aegis-surface shadow-card"
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${meta.bar}`} />
      <div className="pl-4">
        <button
          type="button"
          onClick={() => {
            onJump();
            onDismiss();
          }}
          className="flex w-full flex-col gap-2 p-4 pr-12 text-left transition hover:bg-white/[0.03]"
        >
          <div className="flex items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${meta.tone}`}
            >
              <TriangleAlert className="h-3 w-3" />
              {meta.label}
            </span>
            <span className="font-mono text-[11px] text-slate-500">Frame #{alert.frameIndex}</span>
          </div>
          <p className="text-[13px] leading-6 text-slate-200">{alert.description}</p>
          <span className="inline-flex items-center gap-1 text-[11px] text-aegis-accent">
            Jump to map focus
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
          aria-label="Dismiss alert"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="relative h-1 bg-aegis-surface2">
          <div ref={barRef} className={`absolute left-0 top-0 h-full ${meta.bar}`} />
        </div>
      </div>
    </div>
  );
}

export function AlertProvider({
  children,
  onJumpToFrame,
}: {
  children: ReactNode;
  onJumpToFrame?: (frame: FrameAnalysis) => void;
}) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const showAlert = useCallback((input: ShowAlertInput) => {
    const id = `alert_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const durationMs = input.durationMs ?? 6000;
    setAlerts((prev) => [
      ...prev,
      {
        id,
        frameIndex: input.frameIndex,
        severity: input.severity,
        description: input.description,
        durationMs,
        frame: input.frame,
      },
    ]);
  }, []);

  useEffect(() => {
    if (alerts.length === 0) return;
    const timers = alerts.map((alert) => window.setTimeout(() => dismiss(alert.id), alert.durationMs));
    return () => timers.forEach(clearTimeout);
  }, [alerts, dismiss]);

  const value = useMemo(
    () => ({
      showAlert,
      dismiss,
    }),
    [showAlert, dismiss]
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-6 top-20 z-[100] flex max-h-[min(70vh,520px)] w-[min(100vw-2rem,24rem)] flex-col gap-3 overflow-y-auto pr-1"
        aria-live="polite"
      >
        {alerts.map((alert) => (
          <ToastRow
            key={alert.id}
            alert={alert}
            onDismiss={() => dismiss(alert.id)}
            onJump={() => {
              if (alert.frame && onJumpToFrame) onJumpToFrame(alert.frame);
            }}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}
