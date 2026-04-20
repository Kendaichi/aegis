interface ProgressBarProps {
  label: string;
  /** 0–100; values are clamped for display. Ignored when `indeterminate` is true. */
  percent: number;
  detail?: string;
  /** When true, shows an animated bar with no numeric percentage (e.g. server still processing). */
  indeterminate?: boolean;
  className?: string;
}

function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default function ProgressBar({
  label,
  percent,
  detail,
  indeterminate = false,
  className = "",
}: ProgressBarProps) {
  const p = clampPercent(percent);

  return (
    <div
      className={`rounded-2xl border border-aegis-border bg-aegis-surface2/90 px-3 py-2.5 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>
          {detail ? (
            <p className="mt-1 truncate text-[12px] text-slate-500" title={detail}>
              {detail}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-aegis-accent">
          {indeterminate ? "…" : `${p}%`}
        </span>
      </div>
      <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-aegis-border/60">
        {indeterminate ? (
          <div
            className="progress-indeterminate absolute inset-y-0 left-0 w-2/5 rounded-full bg-aegis-accent shadow-glow"
            role="progressbar"
            aria-label={label}
            aria-busy="true"
          />
        ) : (
          <div
            className="h-full rounded-full bg-aegis-accent shadow-glow transition-[width] duration-150 ease-out"
            style={{ width: `${p}%` }}
            role="progressbar"
            aria-valuenow={p}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label}
          />
        )}
      </div>
    </div>
  );
}
