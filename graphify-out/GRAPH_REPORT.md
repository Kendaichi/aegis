# Graph Report - C:\Users\Frank\Desktop\PROJECTS\aegis  (2026-04-19)

## Corpus Check
- 69 files · ~30,722 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 231 nodes · 367 edges · 48 communities detected
- Extraction: 62% EXTRACTED · 38% INFERRED · 0% AMBIGUOUS · INFERRED: 138 edges (avg confidence: 0.69)
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
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]

## God Nodes (most connected - your core abstractions)
1. `get_supabase (Supabase Client Factory)` - 18 edges
2. `DamageSeverity` - 14 edges
3. `Map()` - 14 edges
4. `Detection` - 12 edges
5. `FrameAnalysis` - 12 edges
6. `chat()` - 11 edges
7. `analyze_frame()` - 10 edges
8. `AnalyzeRequest` - 9 edges
9. `Report` - 9 edges
10. `analyze()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Map()` --calls--> `withMockVisuals()`  [INFERRED]
  C:\Users\carlo\Desktop\aegis\apps\desktop\src\components\ui\map.tsx → C:\Users\carlo\Desktop\aegis\apps\desktop\src\lib\mockApi.ts
- `get_supabase (Supabase Client Factory)` --calls--> `_load_cached_frames()`  [INFERRED]
  apps/api/app/db.py → C:\Users\Frank\Desktop\PROJECTS\aegis\apps\api\app\routers\analyze.py
- `get_supabase (Supabase Client Factory)` --calls--> `_persist_frames()`  [INFERRED]
  apps/api/app/db.py → C:\Users\Frank\Desktop\PROJECTS\aegis\apps\api\app\routers\analyze.py
- `get_supabase (Supabase Client Factory)` --calls--> `get_analysis()`  [INFERRED]
  apps/api/app/db.py → C:\Users\Frank\Desktop\PROJECTS\aegis\apps\api\app\routers\analyze.py
- `get_supabase (Supabase Client Factory)` --calls--> `analyze()`  [INFERRED]
  apps/api/app/db.py → C:\Users\Frank\Desktop\PROJECTS\aegis\apps\api\app\routers\analyze.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.1
Nodes (26): deriveAssessments Builder Function, reportToListItem Converter Function, severityToLevel Converter Function, AssessmentsPage(), buildFrameSystemMessage(), send(), load(), Map() (+18 more)

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (27): _detections_from_row(), Serve the extracted JPEG for a frame (1-based file names on disk)., Return cached frame analyses for a previously analyzed video., Analyze an uploaded video frame-by-frame.      Returns cached results if the vid, _row_to_frame_analysis(), BaseModel, Chat with the AEGIS disaster-assessment assistant.      Pass `session_id` to c, Inject persisted report/analysis context into the system prompt. (+19 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (19): BaseSettings, _build_context_messages(), chat(), _create_session(), _load_session_history(), _persist_messages(), Settings, get_supabase (Supabase Client Factory) (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.22
Nodes (9): runAnalysis(), generate_report(), get_report(), list_reports(), List all reports, optionally filtered by video_id., Generate and persist a disaster assessment report from a video.      Reuses ca, Fetch a previously generated report by its ID., GeoPoint (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (10): _AnalysisJob, analyze(), get_analysis(), _is_missing_column_error(), _load_cached_frames(), _persist_frames(), _serialize_frame_analyses(), stream_analysis() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.25
Nodes (5): _run_analysis_job(), buildMockReport(), nowIso(), sleep(), withMockVisuals()

### Community 6 - "Community 6"
Cohesion: 0.5
Nodes (7): analyze_frame(), chat_completion(), _clamp01(), _frame_data_url(), _get_client(), _get_zai_client(), _mock_frame_analysis()

### Community 7 - "Community 7"
Cohesion: 0.38
Nodes (4): FitBounds(), Marker(), useMap(), ProvinceLayers()

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (3): cleanupVideo(), onSeeked(), load()

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (6): AEGIS Design System (Tailwind Tokens), App Root Component, Main Entry Point, PostCSS Config, Tailwind Config, Vite Config (TS)

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 0.4
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (2): SeverityBadge(), FrameAnalysisFeed Component

### Community 13 - "Community 13"
Cohesion: 0.67
Nodes (2): severityMeta(), ToastRow()

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 0.83
Nodes (3): mapItem(), searchAddresses(), shortLabelFromItem()

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (2): buildHeader(), filenameToTitle()

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (3): Tauri Build Script (build.rs), Tauri App Entry Point (lib.rs), Tauri Main Entry (main.rs)

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
Nodes (2): DetailedInsights Frame Table Component, OverallAssessment Component

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (2): DroneConnect RTSP Feed Component, VideoPlayer Component

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (1): Report View Component

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (1): Stats Cards Dashboard Widget

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (1): downloadReportPdf Export Function

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (1): downloadReportJson Export Function

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (1): Supabase Client Instance

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (1): Notifications Page

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (1): Profile Page

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (1): Resolve an ffmpeg-family executable across local dev and container setups.

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (1): Extract one frame every `interval_seconds` from the video.      Returns the or

## Knowledge Gaps
- **22 isolated node(s):** `Localized damage region on the frame (object-detection style). Coordinates are n`, `Video Service (extract_frames, probe)`, `PostCSS Config`, `Vite Config (TS)`, `Main Entry Point` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 21`** (2 nodes): `main.py`, `health()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `VideoUpload.tsx`, `VideoUpload()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `AppShell()`, `AppShell.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `MapContextPanel.tsx`, `MapContextPanel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `TopNav.tsx`, `handlePointerDown()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `DetailedInsights Frame Table Component`, `OverallAssessment Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `ProgressBar.tsx`, `clampPercent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `DroneConnect RTSP Feed Component`, `VideoPlayer Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `compress.ts`, `compressVideo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `DashboardPage.tsx`, `DashboardPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `vite.config.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `Report View Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `Stats Cards Dashboard Widget`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `ReportPreviewCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `ReportsList.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `downloadReportPdf Export Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `downloadReportJson Export Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `Supabase Client Instance`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `Notifications Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `Profile Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `Resolve an ffmpeg-family executable across local dev and container setups.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `Extract one frame every `interval_seconds` from the video.      Returns the or`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `chat()` connect `Community 2` to `Community 0`, `Community 1`, `Community 6`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Why does `send()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `get_supabase (Supabase Client Factory)` (e.g. with `_load_cached_frames()` and `_persist_frames()`) actually correct?**
  _`get_supabase (Supabase Client Factory)` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 10 inferred relationships involving `DamageSeverity` (e.g. with `_AnalysisJob` and `Best-effort extraction of the first complete {...} block from raw text.`) actually correct?**
  _`DamageSeverity` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `Map()` (e.g. with `shortLabelFromItem()` and `withMockVisuals()`) actually correct?**
  _`Map()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `Detection` (e.g. with `_AnalysisJob` and `Best-effort extraction of the first complete {...} block from raw text.`) actually correct?**
  _`Detection` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Localized damage region on the frame (object-detection style). Coordinates are n`, `Video Service (extract_frames, probe)`, `PostCSS Config` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._