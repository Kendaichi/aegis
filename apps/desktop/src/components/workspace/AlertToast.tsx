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

const MAX_VISIBLE = 3;
const EXIT_ANIM_MS = 220;

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
  exiting,
  onDismiss,
  onJump,
}: {
  alert: AlertItem;
  exiting: boolean;
  onDismiss: () => void;
  onJump: () => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const meta = severityMeta(alert.severity);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!mounted || exiting) return;
    const t = window.setTimeout(onDismiss, alert.durationMs);
    return () => clearTimeout(t);
  }, [mounted, exiting, alert.durationMs, onDismiss]);

  useEffect(() => {
    if (!mounted || exiting) return;
    const element = barRef.current;
    if (!element) return;
    element.style.width = "100%";
    element.style.transition = "none";
    requestAnimationFrame(() => {
      element.style.transition = `width ${alert.durationMs}ms linear`;
      element.style.width = "0%";
    });
  }, [mounted, exiting, alert.durationMs, alert.id]);

  const visible = mounted && !exiting;

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden rounded-card border border-aegis-border bg-aegis-surface shadow-card transform-gpu transition-all duration-200 ease-out ${
        visible
          ? "translate-x-0 scale-100 opacity-100"
          : "translate-x-6 scale-[0.96] opacity-0"
      }`}
      style={{ transitionDuration: `${visible ? 200 : EXIT_ANIM_MS}ms` }}
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
  const [exitingIds, setExitingIds] = useState<Set<string>>(() => new Set());
  const exitScheduled = useRef<Set<string>>(new Set());

  const dismiss = useCallback((id: string) => {
    if (exitScheduled.current.has(id)) return;
    exitScheduled.current.add(id);
    setExitingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    window.setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      setExitingIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      exitScheduled.current.delete(id);
    }, EXIT_ANIM_MS);
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

  const value = useMemo(
    () => ({
      showAlert,
      dismiss,
    }),
    [showAlert, dismiss]
  );

  const visible = alerts.slice(0, MAX_VISIBLE);
  const queuedCount = Math.max(0, alerts.length - visible.length);

  return (
    <AlertContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-6 top-20 z-[100] flex max-h-[min(70vh,520px)] w-[min(100vw-2rem,24rem)] flex-col gap-3 pr-1"
        aria-live="polite"
      >
        {visible.map((alert) => (
          <ToastRow
            key={alert.id}
            alert={alert}
            exiting={exitingIds.has(alert.id)}
            onDismiss={() => dismiss(alert.id)}
            onJump={() => {
              if (alert.frame && onJumpToFrame) onJumpToFrame(alert.frame);
            }}
          />
        ))}
        {queuedCount > 0 && (
          <div className="pointer-events-auto self-end rounded-full border border-aegis-border bg-aegis-surface/90 px-3 py-1 text-[11px] font-medium text-slate-400 shadow-card backdrop-blur">
            +{queuedCount} more alert{queuedCount === 1 ? "" : "s"} queued
          </div>
        )}
      </div>
    </AlertContext.Provider>
  );
}
