# Graph Report - C:\Users\Frank\Desktop\PROJECTS\aegis  (2026-04-20)

## Corpus Check
- 76 files · ~245,440 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 285 nodes · 464 edges · 57 communities detected
- Extraction: 62% EXTRACTED · 38% INFERRED · 0% AMBIGUOUS · INFERRED: 174 edges (avg confidence: 0.67)
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
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]

## God Nodes (most connected - your core abstractions)
1. `get_supabase (Supabase Client Factory)` - 19 edges
2. `DamageSeverity` - 15 edges
3. `Detection` - 14 edges
4. `AnalyzeRequest` - 14 edges
5. `Report` - 14 edges
6. `Map()` - 14 edges
7. `GeoPoint` - 13 edges
8. `FrameAnalysis` - 13 edges
9. `chat()` - 11 edges
10. `generate_report()` - 11 edges

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
Cohesion: 0.16
Nodes (32): _AnalysisJob, analyze(), _detections_from_row(), Serve the extracted JPEG for a frame (1-based file names on disk)., Return cached frame analyses for a previously analyzed video., Analyze an uploaded video frame-by-frame.      Returns cached results if the vid, _row_to_frame_analysis(), BaseModel (+24 more)

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (27): main(), One-shot: copy lat/lng from videos into reports where report lat/lng are NULL., BaseSettings, _build_context_messages(), chat(), _create_session(), _load_session_history(), _persist_messages() (+19 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (20): load(), Map(), MapViewPage(), load(), appendChatMessages(), buildReportByVideo(), displayId(), fetchActiveIncidents() (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.25
Nodes (21): aggregate_severity(), generate_report(), _geo_from_lat_lng_row(), get_report(), list_reports(), List all reports, optionally filtered by video_id., Fetch a previously generated report by its ID., List all reports, optionally filtered by video_id. (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (13): frameImageUrl(), deriveAssessments(), formatDate(), reportToListItem(), severityToLevel(), shortId(), topKeyFrames(), buildFileStem() (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (9): invalidate(), notifyKey(), setCached(), subscribe(), useCachedQuery(), AssessmentsPage(), handleFile(), runAnalysis() (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.39
Nodes (7): get_analysis(), _is_missing_column_error(), _load_cached_frames(), _persist_frames(), _serialize_frame_analyses(), stream_analysis(), _with_image_urls()

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (5): _run_analysis_job(), buildMockReport(), nowIso(), sleep(), withMockVisuals()

### Community 8 - "Community 8"
Cohesion: 0.38
Nodes (4): FitBounds(), Marker(), useMap(), ProvinceLayers()

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (3): cleanupVideo(), onSeeked(), load()

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 0.33
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 0.83
Nodes (3): buildFrameSystemMessage(), playSound(), send()

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 0.67
Nodes (2): severityMeta(), ToastRow()

### Community 15 - "Community 15"
Cohesion: 0.83
Nodes (3): mapItem(), searchAddresses(), shortLabelFromItem()

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (2): buildHeader(), filenameToTitle()

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (3): AEGIS Design System (Tailwind Tokens), PostCSS Config, Tailwind Config

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (3): Tauri Build Script (build.rs), Tauri App Entry Point (lib.rs), Tauri Main Entry (main.rs)

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

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
Nodes (2): DetailedInsights Frame Table Component, OverallAssessment Component

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
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (1): Vite Config (TS)

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (1): Main Entry Point

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (1): Stats Cards Dashboard Widget

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (1): DroneConnect RTSP Feed Component

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (1): Supabase Client Instance

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (1): Notifications Page

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (1): Profile Page

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (1): Resolve an ffmpeg-family executable across local dev and container setups.

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (1): Extract one frame every `interval_seconds` from the video.      Returns the or

## Knowledge Gaps
- **19 isolated node(s):** `Localized damage region on the frame (object-detection style). Coordinates are n`, `One-shot: copy lat/lng from videos into reports where report lat/lng are NULL.`, `Upload a frame JPEG to the public frames bucket and return its public URL.`, `Video Service (extract_frames, probe)`, `PostCSS Config` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 24`** (2 nodes): `main.py`, `health()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `App()`, `App.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `VideoUpload.tsx`, `VideoUpload()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `AppShell()`, `AppShell.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `MapContextPanel.tsx`, `MapContextPanel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `TopNav.tsx`, `handlePointerDown()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `FrameAnalysisCards.tsx`, `damageToSeverityLevel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `AegisLogo()`, `AegisLogo.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `DetailedInsights Frame Table Component`, `OverallAssessment Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (2 nodes): `FrameAnalysisFeed.tsx`, `damageToSeverityLevel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (2 nodes): `ProgressBar.tsx`, `clampPercent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `compress.ts`, `compressVideo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (2 nodes): `DashboardPage.tsx`, `DashboardPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `vite.config.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `Vite Config (TS)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `Main Entry Point`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `Report.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `Stats Cards Dashboard Widget`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `KeyFindingsFrameCards.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `ReportPreviewCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `ReportsList.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `DroneConnect RTSP Feed Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `FrameAnalysisImage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `Supabase Client Instance`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `Notifications Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (1 nodes): `Profile Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `Resolve an ffmpeg-family executable across local dev and container setups.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `Extract one frame every `interval_seconds` from the video.      Returns the or`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Map()` connect `Community 2` to `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 15`?**
  _High betweenness centrality (0.197) - this node is a cross-community bridge._
- **Why does `chat()` connect `Community 1` to `Community 0`, `Community 12`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **Why does `send()` connect `Community 12` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **Are the 18 inferred relationships involving `get_supabase (Supabase Client Factory)` (e.g. with `_load_cached_frames()` and `_persist_frames()`) actually correct?**
  _`get_supabase (Supabase Client Factory)` has 18 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `DamageSeverity` (e.g. with `_AnalysisJob` and `Best-effort extraction of the first complete {...} block from raw text.`) actually correct?**
  _`DamageSeverity` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `Detection` (e.g. with `_AnalysisJob` and `Best-effort extraction of the first complete {...} block from raw text.`) actually correct?**
  _`Detection` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `AnalyzeRequest` (e.g. with `_AnalysisJob` and `Generate and persist a disaster assessment report from a video.      Reuses ca`) actually correct?**
  _`AnalyzeRequest` has 12 INFERRED edges - model-reasoned connections that need verification._