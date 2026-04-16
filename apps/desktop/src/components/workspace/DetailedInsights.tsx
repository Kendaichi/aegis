import { useMemo, useState } from "react";
import type { DamageSeverity, FrameAnalysis } from "../../lib/api";

const ALL: DamageSeverity[] = ["none", "minor", "moderate", "severe", "destroyed"];

interface Props {
  frames: FrameAnalysis[];
  onSelectRow?: (frameIndex: number) => void;
  className?: string;
}

export default function DetailedInsights({ frames, onSelectRow, className = "" }: Props) {
  const [filter, setFilter] = useState<DamageSeverity | "all">("all");

  const rows = useMemo(() => {
    if (filter === "all") return frames;
    return frames.filter((frame) => frame.severity === filter);
  }, [filter, frames]);

  return (
    <div className={`card min-h-0 overflow-hidden ${className}`}>
      <div className="card-header">
        <span className="card-header-title">All Frames</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as DamageSeverity | "all")}
          className="rounded-xl border border-aegis-border bg-aegis-surface2 px-3 py-1.5 text-[11px] text-slate-200 outline-none focus:border-aegis-accent/60"
        >
          <option value="all">All severities</option>
          {ALL.map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </select>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full text-left text-[11px]">
          <thead className="sticky top-0 bg-aegis-surface/95 backdrop-blur-xl">
            <tr className="table-header-row">
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">t(s)</th>
              <th className="px-3 py-2 font-medium">Sev</th>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="px-3 py-2 font-medium">Conf</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((frame) => (
              <tr
                key={frame.frame_index}
                className="cursor-pointer border-t border-aegis-border/80 transition hover:bg-white/[0.03]"
                onClick={() => onSelectRow?.(frame.frame_index)}
              >
                <td className="px-3 py-2 font-mono text-slate-400">{frame.frame_index}</td>
                <td className="px-3 py-2 text-slate-400">{frame.timestamp_seconds.toFixed(1)}</td>
                <td className="px-3 py-2 uppercase text-slate-300">{frame.severity}</td>
                <td
                  className="max-w-[180px] truncate px-3 py-2 text-slate-200"
                  title={frame.description}
                >
                  {frame.description}
                </td>
                <td className="px-3 py-2 text-slate-500">
                  {(frame.confidence * 100).toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-4 text-[12px] text-slate-500">No frames match this filter.</p>
        )}
      </div>
    </div>
  );
}
