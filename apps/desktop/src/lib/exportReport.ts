import jsPDF from "jspdf";
import { frameImageUrl, type FrameAnalysis, type Report } from "./api";
import { topKeyFrames } from "./assessments";

/** Merged object for JSON preview/download (matches Reports UI). */
export type ReportExportPayload = Report & { frame_analyses: FrameAnalysis[] };

export function buildReportExportPayload(
  report: Report,
  frames: FrameAnalysis[] | null | undefined
): ReportExportPayload {
  return { ...report, frame_analyses: frames ?? [] };
}

/** Trigger a browser file download from a Blob. */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Build a filename stem like "AEGIS-AE-2024-047-report-2024-04-10" */
function buildFileStem(report: Report, assessmentId?: string): string {
  const id = assessmentId ?? report.report_id;
  const date = report.created_at.slice(0, 10);
  return `AEGIS-${id}-report-${date}`;
}

const SEVERITY_COLORS: Record<string, [number, number, number]> = {
  none: [16, 185, 129],
  minor: [245, 158, 11],
  moderate: [249, 115, 22],
  severe: [239, 68, 68],
  destroyed: [185, 28, 28],
};

/**
 * Decode the fetched image and re-encode as baseline JPEG for jsPDF.
 * Passing arbitrary data URLs / wrong format strings into addImage() often yields corrupted
 * (striped) output; canvas + toDataURL('image/jpeg') produces bytes jsPDF decodes reliably.
 * Blob URLs are same-origin, so this works even when the original URL is cross-origin.
 */
async function fetchImageAsJpegForPdf(url: string): Promise<{ dataUrl: string; aspect: number } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      const { dataUrl, w, h } = await new Promise<{ dataUrl: string; w: number; h: number }>(
        (resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            if (!w || !h) {
              reject(new Error("zero size"));
              return;
            }
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("no canvas context"));
              return;
            }
            ctx.drawImage(img, 0, 0);
            let jpegDataUrl: string;
            try {
              jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
            } catch {
              reject(new Error("canvas export blocked"));
              return;
            }
            resolve({ dataUrl: jpegDataUrl, w, h });
          };
          img.onerror = () => reject(new Error("image decode failed"));
          img.src = objectUrl;
        }
      );
      return { dataUrl, aspect: w / h };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return null;
  }
}

export async function downloadReportPdf(
  report: Report,
  assessmentId?: string,
  frames?: FrameAnalysis[] | null
): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  const checkPage = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // ── Title ──
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("AEGIS - Disaster Assessment Report", margin, y);
  y += 8;

  // ── Subtitle / metadata ──
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const id = assessmentId ?? report.report_id;
  doc.text(`Assessment: ${id}`, margin, y);
  y += 5;
  doc.text(`Generated: ${new Date(report.created_at).toLocaleString()}`, margin, y);
  y += 5;
  doc.text(`Report ID: ${report.report_id}`, margin, y);
  y += 10;

  // ── Severity badge ──
  const color = SEVERITY_COLORS[report.overall_severity] ?? [100, 100, 100];
  doc.setFillColor(...color);
  doc.roundedRect(margin, y - 4, 40, 8, 2, 2, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(report.overall_severity.toUpperCase(), margin + 20, y + 1, { align: "center" });
  doc.setTextColor(0);
  y += 14;

  // ── Horizontal rule ──
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ── Summary ──
  checkPage(20);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", margin, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(report.summary, contentW);
  checkPage(summaryLines.length * 5);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 5 + 8;

  const addSection = (title: string, items: string[]) => {
    checkPage(20);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    items.forEach((item, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${item}`, contentW);
      checkPage(lines.length * 5 + 2);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 3;
    });
    y += 4;
  };

  // ── Key Findings (with optional frame images) ──
  const topFrames = frames?.length ? topKeyFrames(frames, 5) : [];
  if (topFrames.length > 0) {
    checkPage(25);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Key Findings", margin, y);
    y += 7;

    for (let i = 0; i < topFrames.length; i++) {
      const frame = topFrames[i];
      const findingText =
        report.key_findings[i] ??
        `Frame @ ${frame.timestamp_seconds.toFixed(1)}s — ${frame.severity}: ${frame.description}`;

      if (frame.image_url) {
        const url = frameImageUrl(frame.image_url);
        const loaded = await fetchImageAsJpegForPdf(url);
        if (loaded) {
          const imgW = contentW;
          const imgH = imgW / loaded.aspect;
          checkPage(imgH + 40);
          try {
            doc.addImage(loaded.dataUrl, "JPEG", margin, y, imgW, imgH);

            for (const d of frame.detections ?? []) {
              const rgb = SEVERITY_COLORS[d.severity] ?? [239, 68, 68];
              doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
              doc.setLineWidth(0.35);
              const [x1, y1, x2, y2] = d.bbox;
              const rx = margin + x1 * imgW;
              const ry = y + y1 * imgH;
              const rw = (x2 - x1) * imgW;
              const rh = (y2 - y1) * imgH;
              doc.rect(rx, ry, rw, rh, "S");
            }

            y += imgH + 5;
          } catch {
            /* unsupported image format for jsPDF — fall through to text only */
          }
        }
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(`${i + 1}. ${findingText}`, contentW);
      checkPage(lines.length * 5 + 4);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 6;
    }
    y += 4;
  } else {
    addSection("Key Findings", report.key_findings);
  }

  // ── Recommendations ──
  addSection("Recommendations", report.recommendations);

  // ── Location ──
  if (report.location) {
    checkPage(15);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Location", margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Coordinates: ${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`,
      margin,
      y
    );
    y += 10;
  }

  // ── Footer ──
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Video ID: ${report.video_id}`, margin, pageH - 10);
  doc.text("Generated by AEGIS", pageW - margin, pageH - 10, { align: "right" });

  doc.save(buildFileStem(report, assessmentId) + ".pdf");
}

export function downloadReportJson(
  report: Report,
  assessmentId?: string,
  frames?: FrameAnalysis[] | null
): void {
  const payload = buildReportExportPayload(report, frames);
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  triggerDownload(blob, buildFileStem(report, assessmentId) + ".json");
}
