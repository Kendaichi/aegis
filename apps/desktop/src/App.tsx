import { useState } from "react";
import VideoUpload from "./components/VideoUpload";
import MapView from "./components/Map";
import ReportView from "./components/Report";
import Chat from "./components/Chat";
import { Report } from "./lib/api";

export default function App() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  return (
    <div className="h-full grid grid-cols-12 grid-rows-[auto_1fr] gap-3 p-3">
      <header className="col-span-12 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-wide text-aegis-accent">
          AEGIS
        </h1>
        <span className="text-sm text-aegis-muted">
          AI Disaster Assessment
        </span>
      </header>

      <aside className="col-span-3 bg-aegis-panel rounded-lg p-3 overflow-auto">
        <VideoUpload
          onUploaded={(id) => {
            setVideoId(id);
            setReport(null);
          }}
          onReport={setReport}
          videoId={videoId}
        />
      </aside>

      <section className="col-span-6 bg-aegis-panel rounded-lg overflow-hidden">
        <MapView report={report} />
      </section>

      <aside className="col-span-3 bg-aegis-panel rounded-lg p-3 flex flex-col overflow-hidden">
        <ReportView report={report} />
        <div className="mt-3 flex-1 min-h-0">
          <Chat reportId={report?.report_id} videoId={videoId ?? undefined} />
        </div>
      </aside>
    </div>
  );
}
