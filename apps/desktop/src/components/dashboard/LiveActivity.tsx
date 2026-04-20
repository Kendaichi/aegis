import { useEffect, useState } from "react";
import type { ActivityItem } from "../../lib/mockData";
import { fetchActivityFeed, subscribeToQueueUpdates } from "../../lib/supabaseQueries";
import { BrandedLoaderInline } from "../ui/BrandedLoader";

const kindDot: Record<ActivityItem["kind"], string> = {
  extract: "bg-aegis-accent",
  vlm: "bg-sky-400",
  report: "bg-emerald-500",
  system: "bg-slate-500",
};

export default function LiveActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchActivityFeed(10);
        if (!cancelled) setItems(next);
      } catch {
        if (!cancelled) setItems([]);
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

  return (
    <div className="card flex h-full min-h-0 flex-col overflow-hidden">
      <div className="card-header">
        <div>
          <p className="card-header-title">Activity Feed</p>
          <h3 className="mt-1 text-base font-semibold text-white">Live platform activity</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Live
        </span>
      </div>
      <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-aegis-border bg-aegis-surface2/80 p-3"
          >
            <div className="flex gap-3 text-[13px]">
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${kindDot[item.kind]}`}
              />
              <div>
                <p className="leading-6 text-slate-200">{item.text}</p>
                <p className="mt-1 text-[11px] text-slate-500">{item.time}</p>
              </div>
            </div>
          </li>
        ))}
        {loading && items.length === 0 && (
          <li className="rounded-2xl border border-dashed border-aegis-border bg-aegis-surface2/40 p-4">
            <BrandedLoaderInline message="Loading activity…" />
          </li>
        )}
        {!loading && items.length === 0 && (
          <li className="rounded-2xl border border-dashed border-aegis-border bg-aegis-surface2/40 p-4 text-center text-[12px] text-slate-500">
            No recent activity in the queue.
          </li>
        )}
      </ul>
    </div>
  );
}
