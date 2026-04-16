import type { ActivityItem } from "../../lib/mockData";

const kindDot: Record<ActivityItem["kind"], string> = {
  extract: "bg-aegis-accent",
  vlm: "bg-sky-400",
  report: "bg-emerald-500",
  system: "bg-slate-500",
};

interface Props {
  items: ActivityItem[];
}

export default function LiveActivity({ items }: Props) {
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
      </ul>
    </div>
  );
}
