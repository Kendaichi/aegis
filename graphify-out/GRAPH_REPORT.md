# Graph Report - .  (2026-04-19)

## Corpus Check
- Corpus is ~27,732 words - fits in a single context window. You may not need a graph.

## Summary
- 369 nodes · 542 edges · 67 communities detected
- Extraction: 73% EXTRACTED · 27% INFERRED · 0% AMBIGUOUS · INFERRED: 148 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_API Routers and DB Layer|API Routers and DB Layer]]
- [[_COMMUNITY_Dashboard and Supabase Queries|Dashboard and Supabase Queries]]
- [[_COMMUNITY_Analysis Endpoints|Analysis Endpoints]]
- [[_COMMUNITY_App Configuration|App Configuration]]
- [[_COMMUNITY_App Shell and Core Layout|App Shell and Core Layout]]
- [[_COMMUNITY_VLM Mode and Mock Architecture|VLM Mode and Mock Architecture]]
- [[_COMMUNITY_Alert and Severity Types|Alert and Severity Types]]
- [[_COMMUNITY_Video Processing and Tauri Runtime|Video Processing and Tauri Runtime]]
- [[_COMMUNITY_Assessment Data Utilities|Assessment Data Utilities]]
- [[_COMMUNITY_Mock API Client|Mock API Client]]
- [[_COMMUNITY_Map UI Components|Map UI Components]]
- [[_COMMUNITY_Dashboard Stats and Frame Modal|Dashboard Stats and Frame Modal]]
- [[_COMMUNITY_Video Player Component|Video Player Component]]
- [[_COMMUNITY_Assessment Workspace Flow|Assessment Workspace Flow]]
- [[_COMMUNITY_Map Severity Visualization|Map Severity Visualization]]
- [[_COMMUNITY_Side Navigation|Side Navigation]]
- [[_COMMUNITY_Report Export Utilities|Report Export Utilities]]
- [[_COMMUNITY_MapLibre Context System|MapLibre Context System]]
- [[_COMMUNITY_Report Aggregation Service|Report Aggregation Service]]
- [[_COMMUNITY_Alert Toast System|Alert Toast System]]
- [[_COMMUNITY_Desktop Shell Tauri|Desktop Shell Tauri]]
- [[_COMMUNITY_Chat Interface|Chat Interface]]
- [[_COMMUNITY_Severity and Status Badges|Severity and Status Badges]]
- [[_COMMUNITY_API Client and Image URLs|API Client and Image URLs]]
- [[_COMMUNITY_Mock Data Generator|Mock Data Generator]]
- [[_COMMUNITY_Reports Page|Reports Page]]
- [[_COMMUNITY_Video Compression and Drone|Video Compression and Drone]]
- [[_COMMUNITY_FastAPI Entry Point|FastAPI Entry Point]]
- [[_COMMUNITY_React App Root|React App Root]]
- [[_COMMUNITY_Video Upload Component|Video Upload Component]]
- [[_COMMUNITY_App Shell Layout|App Shell Layout]]
- [[_COMMUNITY_Map Context Panel|Map Context Panel]]
- [[_COMMUNITY_Top Navigation|Top Navigation]]
- [[_COMMUNITY_Drone Connect Handler|Drone Connect Handler]]
- [[_COMMUNITY_Frame Analysis Feed|Frame Analysis Feed]]
- [[_COMMUNITY_Overall Assessment View|Overall Assessment View]]
- [[_COMMUNITY_Video Compression Library|Video Compression Library]]
- [[_COMMUNITY_Dashboard Page|Dashboard Page]]
- [[_COMMUNITY_Profile Page|Profile Page]]
- [[_COMMUNITY_Tauri Build Script|Tauri Build Script]]
- [[_COMMUNITY_Notifications Mock Data|Notifications Mock Data]]
- [[_COMMUNITY_Profile Mock Data|Profile Mock Data]]
- [[_COMMUNITY_Frame Mock Data|Frame Mock Data]]
- [[_COMMUNITY_Supabase Activity Feed|Supabase Activity Feed]]
- [[_COMMUNITY_Dashboard Map Markers|Dashboard Map Markers]]
- [[_COMMUNITY_Report Mock Data|Report Mock Data]]
- [[_COMMUNITY_API Package Init|API Package Init]]
- [[_COMMUNITY_Routers Package Init|Routers Package Init]]
- [[_COMMUNITY_Services Package Init|Services Package Init]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_Vite Type Declarations|Vite Type Declarations]]
- [[_COMMUNITY_Vite Config JS|Vite Config JS]]
- [[_COMMUNITY_Vite Config TS|Vite Config TS]]
- [[_COMMUNITY_React Entry Point|React Entry Point]]
- [[_COMMUNITY_Vite Environment Types|Vite Environment Types]]
- [[_COMMUNITY_Report Preview Card|Report Preview Card]]
- [[_COMMUNITY_Reports List Component|Reports List Component]]
- [[_COMMUNITY_Detailed Insights Component|Detailed Insights Component]]
- [[_COMMUNITY_Supabase Client|Supabase Client]]
- [[_COMMUNITY_Notifications Page|Notifications Page]]
- [[_COMMUNITY_Severity Dot Marker|Severity Dot Marker]]
- [[_COMMUNITY_Notification Type|Notification Type]]
- [[_COMMUNITY_Profile Summary Type|Profile Summary Type]]
- [[_COMMUNITY_Mock Assessments Data|Mock Assessments Data]]
- [[_COMMUNITY_Map View Markers|Map View Markers]]
- [[_COMMUNITY_Claude MD Config|Claude MD Config]]

## God Nodes (most connected - your core abstractions)
1. `get_supabase()` - 24 edges
2. `Map()` - 13 edges
3. `Analyze Router` - 12 edges
4. `Report Router` - 12 edges
5. `Settings` - 11 edges
6. `chat()` - 11 edges
7. `generate_report()` - 11 edges
8. `DamageSeverity` - 10 edges
9. `analyze()` - 10 edges
10. `VLM Service (analyze_frame, chat_completion)` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Settings` --conceptually_related_to--> `API Python Requirements`  [INFERRED]
  apps\api\app\config.py → apps/api/requirements.txt
- `runAnalysis()` --calls--> `Report`  [INFERRED]
  apps\desktop\src\pages\AssessmentsWorkspacePage.tsx → apps\api\app\schemas.py
- `deriveAssessments()` --calls--> `Map()`  [INFERRED]
  apps\desktop\src\lib\assessments.ts → apps\desktop\src\components\ui\map.tsx
- `withMockVisuals()` --calls--> `Map()`  [INFERRED]
  apps\desktop\src\lib\mockApi.ts → apps\desktop\src\components\ui\map.tsx
- `AEGIS README Documentation` --references--> `Supabase Client Instance`  [EXTRACTED]
  README.md → apps/desktop/src/lib/supabase.ts

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

### Community 0 - "API Routers and DB Layer"
Cohesion: 0.14
Nodes (32): BaseModel, _build_context_messages(), chat(), _create_session(), _load_session_history(), _persist_messages(), Chat with the AEGIS disaster-assessment assistant.      Pass `session_id` to c, Inject persisted report/analysis context into the system prompt. (+24 more)

### Community 1 - "Dashboard and Supabase Queries"
Cohesion: 0.1
Nodes (24): AssessmentsPage(), buildHeader(), filenameToTitle(), load(), Map(), MapViewPage(), load(), ReportView() (+16 more)

### Community 2 - "Analysis Endpoints"
Cohesion: 0.16
Nodes (29): analyze(), _detections_from_row(), get_analysis(), get_frame_image(), _is_missing_column_error(), _load_cached_frames(), _persist_frames(), Serve the extracted JPEG for a frame (1-based file names on disk). (+21 more)

### Community 3 - "App Configuration"
Cohesion: 0.15
Nodes (26): BaseSettings, Settings, AEGIS FastAPI Application, API Python Requirements, Analyze Router, Chat Router, Report Router, Upload Router (+18 more)

### Community 4 - "App Shell and Core Layout"
Cohesion: 0.11
Nodes (25): AEGIS Design System (Tailwind Tokens), App Root Component, App Shell Layout, Chat Component, API Client Library, Video Compression Utility, Mock Data / Type Definitions, Supabase Query Helpers (+17 more)

### Community 5 - "VLM Mode and Mock Architecture"
Cohesion: 0.1
Nodes (25): Assessment Lifecycle (pendingâ†’analyzingâ†’complete), Supabase Realtime Queue Subscription, VLM Mode Switch (mock/real/zai), AEGIS README Documentation, Mock Frame Analysis Data, Build Mock Report Function, Mock API Client, With Mock Visuals Decorator (+17 more)

### Community 6 - "Alert and Severity Types"
Cohesion: 0.12
Nodes (24): AlertItem Interface, AlertProvider Context Component, useAlert Hook, DamageSeverity API Type, Detection Bounding Box Type, FrameAnalysis API Type, Report API Type, frameImageUrl Helper Function (+16 more)

### Community 7 - "Video Processing and Tauri Runtime"
Cohesion: 0.23
Nodes (9): run(), main(), extract_frames(), _probe(), probe_duration_seconds(), Resolve an ffmpeg-family executable across local dev and container setups., Extract one frame every `interval_seconds` from the video.      Returns the or, _resolve_binary() (+1 more)

### Community 8 - "Assessment Data Utilities"
Cohesion: 0.39
Nodes (6): deriveAssessments(), formatDate(), locationLabel(), reportToListItem(), severityToLevel(), shortId()

### Community 9 - "Mock API Client"
Cohesion: 0.29
Nodes (3): buildMockReport(), nowIso(), withMockVisuals()

### Community 10 - "Map UI Components"
Cohesion: 0.38
Nodes (4): FitBounds(), Marker(), useMap(), ProvinceLayers()

### Community 11 - "Dashboard Stats and Frame Modal"
Cohesion: 0.33
Nodes (3): cleanupVideo(), onSeeked(), load()

### Community 12 - "Video Player Component"
Cohesion: 0.33
Nodes (0): 

### Community 13 - "Assessment Workspace Flow"
Cohesion: 0.33
Nodes (1): runAnalysis()

### Community 14 - "Map Severity Visualization"
Cohesion: 0.4
Nodes (0): 

### Community 15 - "Side Navigation"
Cohesion: 0.4
Nodes (0): 

### Community 16 - "Report Export Utilities"
Cohesion: 0.7
Nodes (4): buildFileStem(), downloadReportJson(), downloadReportPdf(), triggerDownload()

### Community 17 - "MapLibre Context System"
Cohesion: 0.5
Nodes (5): FitBounds Component, Map MapLibre GL Component, Marker Component, useMap Context Hook, ProvinceLayers GeoJSON Component

### Community 18 - "Report Aggregation Service"
Cohesion: 0.83
Nodes (3): aggregate_severity(), _recommend(), summarize()

### Community 19 - "Alert Toast System"
Cohesion: 0.67
Nodes (2): severityMeta(), ToastRow()

### Community 20 - "Desktop Shell Tauri"
Cohesion: 0.5
Nodes (4): Desktop App HTML Entry, Tauri Build Script (build.rs), Tauri App Entry Point (lib.rs), Tauri Main Entry (main.rs)

### Community 21 - "Chat Interface"
Cohesion: 1.0
Nodes (2): buildFrameSystemMessage(), send()

### Community 22 - "Severity and Status Badges"
Cohesion: 0.67
Nodes (0): 

### Community 23 - "API Client and Image URLs"
Cohesion: 0.67
Nodes (0): 

### Community 24 - "Mock Data Generator"
Cohesion: 0.67
Nodes (0): 

### Community 25 - "Reports Page"
Cohesion: 0.67
Nodes (0): 

### Community 26 - "Video Compression and Drone"
Cohesion: 0.67
Nodes (3): compressVideo FFmpeg Function, DroneConnect RTSP Feed Component, VideoPlayer Component

### Community 27 - "FastAPI Entry Point"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "React App Root"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Video Upload Component"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "App Shell Layout"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Map Context Panel"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Top Navigation"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Drone Connect Handler"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Frame Analysis Feed"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Overall Assessment View"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Video Compression Library"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Dashboard Page"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Profile Page"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Tauri Build Script"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Notifications Mock Data"
Cohesion: 1.0
Nodes (2): Mock Notifications Data, Notifications Page

### Community 41 - "Profile Mock Data"
Cohesion: 1.0
Nodes (2): Profile Summary Data, Profile Page

### Community 42 - "Frame Mock Data"
Cohesion: 1.0
Nodes (2): Mock Frames By Assessment ID, Generate Frames Function

### Community 43 - "Supabase Activity Feed"
Cohesion: 1.0
Nodes (2): VideoRow Internal Type, Fetch Activity Feed Query

### Community 44 - "Dashboard Map Markers"
Cohesion: 1.0
Nodes (2): Dashboard Map Markers Data, Dashboard Page

### Community 45 - "Report Mock Data"
Cohesion: 1.0
Nodes (2): Mock Report By Assessment ID, Reports Page

### Community 46 - "API Package Init"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Routers Package Init"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Services Package Init"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "PostCSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Tailwind Config"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Vite Type Declarations"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Vite Config JS"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Vite Config TS"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "React Entry Point"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Vite Environment Types"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Report Preview Card"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Reports List Component"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Detailed Insights Component"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Supabase Client"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Notifications Page"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Severity Dot Marker"
Cohesion: 1.0
Nodes (1): SeverityDot Marker Component

### Community 62 - "Notification Type"
Cohesion: 1.0
Nodes (1): NotificationItem Interface

### Community 63 - "Profile Summary Type"
Cohesion: 1.0
Nodes (1): ProfileSummary Interface

### Community 64 - "Mock Assessments Data"
Cohesion: 1.0
Nodes (1): Mock Assessments Data

### Community 65 - "Map View Markers"
Cohesion: 1.0
Nodes (1): Map View Markers Data

### Community 66 - "Claude MD Config"
Cohesion: 1.0
Nodes (1): CLAUDE.md Project Instructions

## Ambiguous Edges - Review These
- `Assessments Workspace Page` → `Supabase Realtime Queue Subscription`  [AMBIGUOUS]
  apps/desktop/src/pages/AssessmentsWorkspacePage.tsx · relation: conceptually_related_to

## Knowledge Gaps
- **54 isolated node(s):** `Localized damage region on the frame (object-detection style). Coordinates are n`, `Resolve an ffmpeg-family executable across local dev and container setups.`, `Extract one frame every `interval_seconds` from the video.      Returns the or`, `UploadResponse (Pydantic Model)`, `VideoListItem (Pydantic Model)` (+49 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `FastAPI Entry Point`** (2 nodes): `main.py`, `health()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React App Root`** (2 nodes): `App()`, `App.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Video Upload Component`** (2 nodes): `VideoUpload.tsx`, `VideoUpload()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Shell Layout`** (2 nodes): `AppShell.tsx`, `AppShell()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Map Context Panel`** (2 nodes): `MapContextPanel.tsx`, `MapContextPanel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Top Navigation`** (2 nodes): `TopNav.tsx`, `handlePointerDown()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Drone Connect Handler`** (2 nodes): `DroneConnect.tsx`, `handleConnect()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frame Analysis Feed`** (2 nodes): `FrameAnalysisFeed.tsx`, `damageToSeverityLevel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Overall Assessment View`** (2 nodes): `OverallAssessment.tsx`, `countBySeverity()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Video Compression Library`** (2 nodes): `compress.ts`, `compressVideo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard Page`** (2 nodes): `DashboardPage.tsx`, `DashboardPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Profile Page`** (2 nodes): `ProfilePage.tsx`, `ProfilePage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tauri Build Script`** (2 nodes): `build.rs`, `main()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Notifications Mock Data`** (2 nodes): `Mock Notifications Data`, `Notifications Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Profile Mock Data`** (2 nodes): `Profile Summary Data`, `Profile Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frame Mock Data`** (2 nodes): `Mock Frames By Assessment ID`, `Generate Frames Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Supabase Activity Feed`** (2 nodes): `VideoRow Internal Type`, `Fetch Activity Feed Query`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard Map Markers`** (2 nodes): `Dashboard Map Markers Data`, `Dashboard Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Report Mock Data`** (2 nodes): `Mock Report By Assessment ID`, `Reports Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Package Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Routers Package Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Services Package Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS Config`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tailwind Config`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Type Declarations`** (1 nodes): `vite.config.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config JS`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config TS`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React Entry Point`** (1 nodes): `main.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Environment Types`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Report Preview Card`** (1 nodes): `ReportPreviewCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Reports List Component`** (1 nodes): `ReportsList.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Detailed Insights Component`** (1 nodes): `DetailedInsights.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Supabase Client`** (1 nodes): `supabase.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Notifications Page`** (1 nodes): `NotificationsPage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Severity Dot Marker`** (1 nodes): `SeverityDot Marker Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Notification Type`** (1 nodes): `NotificationItem Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Profile Summary Type`** (1 nodes): `ProfileSummary Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mock Assessments Data`** (1 nodes): `Mock Assessments Data`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Map View Markers`** (1 nodes): `Map View Markers Data`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Claude MD Config`** (1 nodes): `CLAUDE.md Project Instructions`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Assessments Workspace Page` and `Supabase Realtime Queue Subscription`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `get_supabase()` connect `API Routers and DB Layer` to `Analysis Endpoints`, `App Configuration`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `Map()` connect `Dashboard and Supabase Queries` to `Assessment Data Utilities`, `Mock API Client`, `Map UI Components`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `Map View Page` connect `VLM Mode and Mock Architecture` to `Dashboard and Supabase Queries`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `get_supabase()` (e.g. with `_load_cached_frames()` and `_persist_frames()`) actually correct?**
  _`get_supabase()` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `Map()` (e.g. with `ReportView()` and `deriveAssessments()`) actually correct?**
  _`Map()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Localized damage region on the frame (object-detection style). Coordinates are n`, `Resolve an ffmpeg-family executable across local dev and container setups.`, `Extract one frame every `interval_seconds` from the video.      Returns the or` to the rest of the system?**
  _54 weakly-connected nodes found - possible documentation gaps or missing edges._