import { Report } from "../lib/api";

interface Props {
  report: Report | null;
}

const severityColor: Record<string, string> = {
  none: "bg-emerald-600",
  minor: "bg-yellow-500",
  moderate: "bg-orange-500",
  severe: "bg-red-600",
  destroyed: "bg-red-800",
};

export default function ReportView({ report }: Props) {
  if (!report) {
    return (
      <div className="text-xs text-aegis-muted">
        No report yet. Upload a video and click "Analyze" to generate one.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold text-white ${
            severityColor[report.overall_severity] ?? "bg-slate-600"
          }`}
        >
          {report.overall_severity.toUpperCase()}
        </span>
        <span className="text-xs text-aegis-muted">
          {new Date(report.created_at).toLocaleString()}
        </span>
      </div>

      <p className="text-sm leading-snug">{report.summary}</p>

      <div>
        <h3 className="text-xs font-semibold uppercase text-aegis-muted">
          Key findings
        </h3>
        <ul className="mt-1 space-y-1 text-xs list-disc pl-4">
          {report.key_findings.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase text-aegis-muted">
          Recommendations
        </h3>
        <ul className="mt-1 space-y-1 text-xs list-disc pl-4">
          {report.recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
