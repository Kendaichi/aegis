# Graph Report - C:\Users\Frank\Desktop\PROJECTS\aegis  (2026-04-19)

## Corpus Check
- 66 files · ~28,274 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 178 nodes · 269 edges · 37 communities detected
- Extraction: 65% EXTRACTED · 35% INFERRED · 0% AMBIGUOUS · INFERRED: 94 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]

## God Nodes (most connected - your core abstractions)
1. `DamageSeverity` - 12 edges
2. `Detection` - 10 edges
3. `FrameAnalysis` - 10 edges
4. `AnalyzeRequest` - 10 edges
5. `Report Router` - 10 edges
6. `Map MapLibre GL Component` - 10 edges
7. `Settings` - 9 edges
8. `_AnalysisJob` - 8 edges
9. `AnalyzeResponse` - 7 edges
10. `Report` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Settings` --conceptually_related_to--> `API Python Requirements`  [INFERRED]
  C:\Users\Frank\Desktop\PROJECTS\aegis\apps\api\app\config.py → apps/api/requirements.txt
- `AnalyzeRequest` --uses--> `_AnalysisJob`  [INFERRED]
  C:\Users\Frank\Desktop\PROJECTS\aegis\apps\api\app\schemas.py → C:\Users\Frank\Desktop\PROJECTS\aegis\apps\api\app\routers\analyze.py
- `AnalyzeRequest` --uses--> `Serve the extracted JPEG for a frame (1-based file names on disk).`  [INFERRED]
  C:\Users\Frank\Desktop\PROJECTS\aegis\apps\api\app\schemas.py → apps\api\app\routers\analyze.py
- `AnalyzeRequest` --uses--> `Return cached frame analyses for a previously analyzed video.`  [INFERRED]
  C:\Users\Frank\Desktop\PROJECTS\aegis\apps\api\app\schemas.py → apps\api\app\routers\analyze.py
- `AnalyzeRequest` --uses--> `Analyze an uploaded video frame-by-frame.      Returns cached results if the v`  [INFERRED]
  C:\Users\Frank\Desktop\PROJECTS\aegis\apps\api\app\schemas.py → apps\api\app\routers\analyze.py

## Hyperedges (group relationships)
- **Video Analysis Pipeline (Upload â†’ Extract â†’ VLM â†’ Persist)** — router_upload, service_storage, service_video, service_vlm, router_analyze [INFERRED 0.90]
- **Report Generation Flow (Frames â†’ Aggregate â†’ Summarize â†’ Persist)** — router_report, service_report, service_vlm, schemas_FrameAnalysis, schemas_Report [INFERRED 0.88]
- **Chat Context Injection (Report + Frames â†’ System Prompt â†’ VLM)** — router_chat, schemas_Report, schemas_FrameAnalysis, service_vlm [INFERRED 0.85]
- **Dashboard Real-Time Widgets via Supabase** — liveactivity_tsx, recentassessments_tsx, severitydistribution_tsx, statscards_tsx, lib_supabasequeries [EXTRACTED 1.00]
- **Video Upload to Report Analysis Pipeline** — videoupload_tsx, lib_api, report_tsx, chat_tsx [EXTRACTED 1.00]
- **Map Spatial Context and Incident Display** — map_tsx, mapcontextpanel_tsx, ui_map, ui_provincelayers [EXTRACTED 0.95]
- **Frame Analysis Pipeline (FrameAnalysis data flow)** — api_FrameAnalysis, frameanalysisfeed_FrameAnalysisFeed, frameimagemodal_FrameImageModal, detailedinsights_DetailedInsights, overallassessment_OverallAssessment [INFERRED 0.90]
- **Map Layer System (MapLibre context + layers)** — map_Map, map_useMap, provincelayers_ProvinceLayers, map_Marker, map_FitBounds [EXTRACTED 1.00]
- **Report Export Flow (Report -> PDF/JSON download)** — api_Report, reportpreviewcard_ReportPreviewCard, exportreport_downloadReportPdf, exportreport_downloadReportJson [INFERRED 0.90]
- **Dashboard Data Flow: Supabase â†’ Queries â†’ DashboardPage** — supabase_supabaseClient, supabaseQueries_fetchDashboardStats, pages_DashboardPage [INFERRED 0.85]
- **Mock vs Real API Duality: mockApi / supabaseQueries / VLM Mode** — mockApi_mockApi, supabaseQueries_fetchRecentAssessments, concept_vlmMode [INFERRED 0.82]
- **Map View Realtime Pipeline: Supabase â†’ fetchMapMarkers â†’ MapViewPage** — supabase_supabaseClient, supabaseQueries_fetchMapMarkers, pages_MapViewPage [EXTRACTED 0.95]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (33): deriveAssessments Builder Function, reportToListItem Converter Function, severityToLevel Converter Function, Assessment Lifecycle (pendingâ†’analyzingâ†’complete), Supabase Realtime Queue Subscription, FitBounds Component, Map MapLibre GL Component, Marker Component (+25 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (29): BaseModel, BaseSettings, Chat with the AEGIS disaster-assessment assistant.      Pass `session_id` to c, Inject persisted report/analysis context into the system prompt., Settings, get_supabase (Supabase Client Factory), Enum, AEGIS FastAPI Application (+21 more)

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (22): _AnalysisJob, _detections_from_row(), Serve the extracted JPEG for a frame (1-based file names on disk)., Return cached frame analyses for a previously analyzed video., Analyze an uploaded video frame-by-frame.      Returns cached results if the v, _row_to_frame_analysis(), AnalyzeResponse, DamageSeverity (+14 more)

### Community 3 - "Community 3"
Cohesion: 0.29
Nodes (10): analyze(), get_analysis(), _is_missing_column_error(), _load_cached_frames(), _persist_frames(), _run_analysis_job(), _serialize_frame_analyses(), stream_analysis() (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (11): Mock Data / Type Definitions, Supabase Query Helpers, Live Activity Dashboard Widget, Map View Component, Map Context Panel, Recent Assessments Dashboard Widget, Severity Distribution Dashboard Widget, Stats Cards Dashboard Widget (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.22
Nodes (9): AEGIS Design System (Tailwind Tokens), App Root Component, App Shell Layout, Main Entry Point, Side Navigation, Top Navigation, PostCSS Config, Tailwind Config (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.25
Nodes (8): AlertProvider Context Component, useAlert Hook, SeverityBadge UI Component, StatusBadge UI Component, FrameAnalysisFeed Component, ReportsList Component, SideNav Component, TopNav Component

### Community 7 - "Community 7"
Cohesion: 0.5
Nodes (2): cleanupVideo(), onSeeked()

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (3): compressVideo FFmpeg Function, DroneConnect RTSP Feed Component, VideoPlayer Component

### Community 9 - "Community 9"
Cohesion: 0.67
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 0.67
Nodes (3): Video Compression Utility, Report View Component, Video Upload Component

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (3): Tauri Build Script (build.rs), Tauri App Entry Point (lib.rs), Tauri Main Entry (main.rs)

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (2): DetailedInsights Frame Table Component, OverallAssessment Component

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (2): downloadReportPdf Export Function, ReportPreviewCard Component

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (2): Mock Notifications Data, Notifications Page

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (2): Profile Summary Data, Profile Page

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (2): Dashboard Map Markers Data, Dashboard Page

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (2): Mock Report By Assessment ID, Reports Page

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (2): Mock Frames By Assessment ID, Generate Frames Function

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (2): VLM Mode Switch (mock/real/zai), AEGIS README Documentation

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (1): Chat Component

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (1): SeverityDot Marker Component

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (1): AlertItem Interface

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (1): downloadReportJson Export Function

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (1): NotificationItem Interface

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (1): ProfileSummary Interface

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (1): Mock Assessments Data

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (1): Map View Markers Data

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (1): Resolve an ffmpeg-family executable across local dev and container setups.

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (1): Extract one frame every `interval_seconds` from the video.      Returns the or

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (1): CLAUDE.md Project Instructions

## Ambiguous Edges - Review These
- `Supabase Realtime Queue Subscription` → `Assessments Workspace Page`  [AMBIGUOUS]
  apps/desktop/src/pages/AssessmentsWorkspacePage.tsx · relation: conceptually_related_to

## Knowledge Gaps
- **54 isolated node(s):** `Localized damage region on the frame (object-detection style). Coordinates are n`, `PostCSS Config`, `Vite Config (TS)`, `Main Entry Point`, `Chat Component` (+49 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 12`** (2 nodes): `DetailedInsights Frame Table Component`, `OverallAssessment Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (2 nodes): `downloadReportPdf Export Function`, `ReportPreviewCard Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `Mock Notifications Data`, `Notifications Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `Profile Summary Data`, `Profile Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `Dashboard Map Markers Data`, `Dashboard Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `Mock Report By Assessment ID`, `Reports Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `Mock Frames By Assessment ID`, `Generate Frames Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `VLM Mode Switch (mock/real/zai)`, `AEGIS README Documentation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `vite.config.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `Chat Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `SeverityDot Marker Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `AlertItem Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `downloadReportJson Export Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `NotificationItem Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `ProfileSummary Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `Mock Assessments Data`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `Map View Markers Data`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `Resolve an ffmpeg-family executable across local dev and container setups.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `Extract one frame every `interval_seconds` from the video.      Returns the or`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `CLAUDE.md Project Instructions`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Supabase Realtime Queue Subscription` and `Assessments Workspace Page`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Report Router` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `DamageSeverity` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `DamageSeverity` (e.g. with `_AnalysisJob` and `_detections_from_row()`) actually correct?**
  _`DamageSeverity` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `Detection` (e.g. with `_AnalysisJob` and `_detections_from_row()`) actually correct?**
  _`Detection` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `FrameAnalysis` (e.g. with `_AnalysisJob` and `_row_to_frame_analysis()`) actually correct?**
  _`FrameAnalysis` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `AnalyzeRequest` (e.g. with `_AnalysisJob` and `Serve the extracted JPEG for a frame (1-based file names on disk).`) actually correct?**
  _`AnalyzeRequest` has 7 INFERRED edges - model-reasoned connections that need verification._