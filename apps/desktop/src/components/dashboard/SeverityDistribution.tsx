import { useEffect, useState } from "react";
import type { SeverityDistributionItem } from "../../lib/mockData";
import {
  fetchSeverityDistribution,
  subscribeToQueueUpdates,
} from "../../lib/supabaseQueries";

const EMPTY_DISTRIBUTION: SeverityDistributionItem[] = [
  { level: 5, label: "Critical", zones: 0, pct: 0 },
  { level: 4, label: "Severe", zones: 0, pct: 0 },
  { level: 3, label: "Moderate", zones: 0, pct: 0 },
  { level: 2, label: "Minor", zones: 0, pct: 0 },
];

const barColor: Record<number, string> = {
  5: "bg-red-600",
  4: "bg-orange-500",
  3: "bg-amber-500",
  2: "bg-emerald-500",
};

export default function SeverityDistribution() {
  const [items, setItems] = useState<SeverityDistributionItem[]>(EMPTY_DISTRIBUTION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchSeverityDistribution();
        if (!cancelled) setItems(next);
      } catch {
        if (!cancelled) setItems(EMPTY_DISTRIBUTION);
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
  }, []);

  const totalZones = items.reduce((acc, row) => acc + row.zones, 0);

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-title">Severity Distribution</p>
          <h3 className="mt-2 text-base font-semibold text-white">This week by impact level</h3>
        </div>
        <span className="rounded-full border border-aegis-border bg-aegis-surface2 px-2.5 py-1 text-[11px] text-slate-400">
          {loading ? "Loading…" : `${totalZones} zones tracked`}
        </span>
      </div>
      <ul className="mt-5 space-y-4">
        {items.map((row) => (
          <li key={row.level}>
            <div className="mb-2 flex items-center justify-between gap-3 text-[12px]">
              <span className="text-slate-300">
                Severity {row.level} <span className="text-slate-500">/ {row.label}</span>
              </span>
              <span className="text-slate-400">
                {row.zones} zones · {row.pct}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-aegis-surface2">
              <div
                className={`h-full rounded-full ${barColor[row.level] ?? "bg-slate-600"}`}
                style={{ width: `${row.pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
