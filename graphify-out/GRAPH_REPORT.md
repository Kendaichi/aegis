# Graph Report - C:\Users\Frank\Desktop\PROJECTS\aegis  (2026-04-19)

## Corpus Check
- 66 files · ~27,771 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 160 nodes · 227 edges · 31 communities detected
- Extraction: 69% EXTRACTED · 31% INFERRED · 0% AMBIGUOUS · INFERRED: 70 edges (avg confidence: 0.63)
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

## God Nodes (most connected - your core abstractions)
1. `Analyze Router` - 11 edges
2. `Report Router` - 11 edges
3. `Settings` - 10 edges
4. `Map MapLibre GL Component` - 10 edges
5. `AnalyzeRequest (Pydantic Model)` - 9 edges
6. `DamageSeverity (Enum)` - 8 edges
7. `FrameAnalysis (Pydantic Model)` - 8 edges
8. `GeoPoint (Pydantic Model)` - 7 edges
9. `Report (Pydantic Model)` - 7 edges
10. `Report API Type` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Settings` --conceptually_related_to--> `API Python Requirements`  [INFERRED]
  C:\Users\Frank\Desktop\PROJECTS\aegis\apps\api\app\config.py → apps/api/requirements.txt
- `DamageSeverity (Enum)` --uses--> `Serve the extracted JPEG for a frame (1-based file names on disk).`  [INFERRED]
  apps/api/app/schemas.py → apps\api\app\routers\analyze.py
- `DamageSeverity (Enum)` --uses--> `Return cached frame analyses for a previously analyzed video.`  [INFERRED]
  apps/api/app/schemas.py → apps\api\app\routers\analyze.py
- `DamageSeverity (Enum)` --uses--> `Analyze an uploaded video frame-by-frame.      Returns cached results if the v`  [INFERRED]
  apps/api/app/schemas.py → apps\api\app\routers\analyze.py
- `GeoPoint (Pydantic Model)` --uses--> `Generate and persist a disaster assessment report from a video.      Reuses ca`  [INFERRED]
  apps/api/app/schemas.py → apps\api\app\routers\report.py

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
Cohesion: 0.09
Nodes (30): Assessment Lifecycle (pendingâ†’analyzingâ†’complete), Supabase Realtime Queue Subscription, FitBounds Component, Map MapLibre GL Component, Marker Component, useMap Context Hook, Mock Frame Analysis Data, Build Mock Report Function (+22 more)

### Community 1 - "Community 1"
Cohesion: 0.21
Nodes (24): Serve the extracted JPEG for a frame (1-based file names on disk)., Return cached frame analyses for a previously analyzed video., Analyze an uploaded video frame-by-frame.      Returns cached results if the v, BaseSettings, Settings, get_supabase (Supabase Client Factory), AEGIS FastAPI Application, List all reports, optionally filtered by video_id. (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (24): AlertItem Interface, AlertProvider Context Component, useAlert Hook, DamageSeverity API Type, Detection Bounding Box Type, FrameAnalysis API Type, Report API Type, frameImageUrl Helper Function (+16 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (14): AEGIS Design System (Tailwind Tokens), App Root Component, App Shell Layout, Chat Component, API Client Library, Video Compression Utility, Main Entry Point, Side Navigation (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (11): Mock Data / Type Definitions, Supabase Query Helpers, Live Activity Dashboard Widget, Map View Component, Map Context Panel, Recent Assessments Dashboard Widget, Severity Distribution Dashboard Widget, Stats Cards Dashboard Widget (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.42
Nodes (9): analyze_frame(), chat_completion(), _clamp01(), _frame_data_url(), _get_client(), _get_zai_client(), _mock_frame_analysis(), _parse_detections() (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.6
Nodes (6): Upload Router, UploadResponse (Pydantic Model), VideoListItem (Pydantic Model), VideoListResponse (Pydantic Model), Upload a disaster footage video.      Accepts any `video/*` content type. Opti, List all uploaded videos.      Returns every video record from the database wi

### Community 7 - "Community 7"
Cohesion: 0.73
Nodes (6): Chat with the AEGIS disaster-assessment assistant.      Pass `session_id` to c, Inject persisted report/analysis context into the system prompt., Chat Router, ChatMessage (Pydantic Model), ChatRequest (Pydantic Model), ChatResponse (Pydantic Model)

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (3): compressVideo FFmpeg Function, DroneConnect RTSP Feed Component, VideoPlayer Component

### Community 9 - "Community 9"
Cohesion: 0.67
Nodes (3): Tauri Build Script (build.rs), Tauri App Entry Point (lib.rs), Tauri Main Entry (main.rs)

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (2): Mock Notifications Data, Notifications Page

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (2): Profile Summary Data, Profile Page

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (2): Dashboard Map Markers Data, Dashboard Page

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (2): Mock Report By Assessment ID, Reports Page

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (2): Mock Frames By Assessment ID, Generate Frames Function

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (2): VLM Mode Switch (mock/real/zai), AEGIS README Documentation

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (1): SeverityDot Marker Component

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (1): NotificationItem Interface

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (1): ProfileSummary Interface

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (1): Mock Assessments Data

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (1): Map View Markers Data

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (1): Localized damage region on the frame (object-detection style). Coordinates are n

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (1): Resolve an ffmpeg-family executable across local dev and container setups.

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (1): Extract one frame every `interval_seconds` from the video.      Returns the or

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (1): CLAUDE.md Project Instructions

## Ambiguous Edges - Review These
- `Supabase Realtime Queue Subscription` → `Assessments Workspace Page`  [AMBIGUOUS]
  apps/desktop/src/pages/AssessmentsWorkspacePage.tsx · relation: conceptually_related_to

## Knowledge Gaps
- **48 isolated node(s):** `PostCSS Config`, `Vite Config (TS)`, `Main Entry Point`, `Chat Component`, `Side Navigation` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 10`** (2 nodes): `Mock Notifications Data`, `Notifications Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (2 nodes): `Profile Summary Data`, `Profile Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (2 nodes): `Dashboard Map Markers Data`, `Dashboard Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (2 nodes): `Mock Report By Assessment ID`, `Reports Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `Mock Frames By Assessment ID`, `Generate Frames Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `VLM Mode Switch (mock/real/zai)`, `AEGIS README Documentation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `vite.config.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `SeverityDot Marker Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `NotificationItem Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `ProfileSummary Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `Mock Assessments Data`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `Map View Markers Data`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `Localized damage region on the frame (object-detection style). Coordinates are n`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `Resolve an ffmpeg-family executable across local dev and container setups.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `Extract one frame every `interval_seconds` from the video.      Returns the or`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `CLAUDE.md Project Instructions`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Supabase Realtime Queue Subscription` and `Assessments Workspace Page`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Map MapLibre GL Component` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `deriveAssessments Builder Function` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `Map MapLibre GL Component` (e.g. with `ProvinceLayers GeoJSON Component` and `deriveAssessments Builder Function`) actually correct?**
  _`Map MapLibre GL Component` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `AnalyzeRequest (Pydantic Model)` (e.g. with `Serve the extracted JPEG for a frame (1-based file names on disk).` and `Return cached frame analyses for a previously analyzed video.`) actually correct?**
  _`AnalyzeRequest (Pydantic Model)` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PostCSS Config`, `Vite Config (TS)`, `Main Entry Point` to the rest of the system?**
  _48 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._