# Graph Report - C:\Users\carlo\Desktop\aegis  (2026-04-19)

## Corpus Check
- 69 files · ~3,304,276 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 252 nodes · 382 edges · 52 communities detected
- Extraction: 68% EXTRACTED · 32% INFERRED · 0% AMBIGUOUS · INFERRED: 124 edges (avg confidence: 0.71)
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

## God Nodes (most connected - your core abstractions)
1. `get_supabase()` - 18 edges
2. `Map()` - 14 edges
3. `chat()` - 11 edges
4. `generate_report()` - 11 edges
5. `DamageSeverity` - 10 edges
6. `analyze()` - 10 edges
7. `Detection` - 9 edges
8. `Report` - 9 edges
9. `analyze_frame()` - 9 edges
10. `FrameAnalysis` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Report` --calls--> `runAnalysis()`  [INFERRED]
  C:\Users\carlo\Desktop\aegis\apps\api\app\schemas.py → C:\Users\carlo\Desktop\aegis\apps\desktop\src\pages\AssessmentsWorkspacePage.tsx
- `Map()` --calls--> `deriveAssessments()`  [INFERRED]
  C:\Users\carlo\Desktop\aegis\apps\desktop\src\components\ui\map.tsx → C:\Users\carlo\Desktop\aegis\apps\desktop\src\lib\assessments.ts
- `Map()` --calls--> `withMockVisuals()`  [INFERRED]
  C:\Users\carlo\Desktop\aegis\apps\desktop\src\components\ui\map.tsx → C:\Users\carlo\Desktop\aegis\apps\desktop\src\lib\mockApi.ts
- `get_supabase()` --calls--> `get_report()`  [INFERRED]
  C:\Users\carlo\Desktop\aegis\apps\api\app\db.py → C:\Users\carlo\Desktop\aegis\apps\api\app\routers\report.py
- `get_supabase()` --calls--> `list_reports()`  [INFERRED]
  C:\Users\carlo\Desktop\aegis\apps\api\app\db.py → C:\Users\carlo\Desktop\aegis\apps\api\app\routers\report.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.1
Nodes (25): AssessmentsPage(), mapItem(), searchAddresses(), shortLabelFromItem(), load(), Map(), MapViewPage(), load() (+17 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (22): analyze(), get_analysis(), get_frame_image(), _is_missing_column_error(), _load_cached_frames(), _persist_frames(), _serialize_frame_analyses(), _with_image_urls() (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.2
Nodes (22): BaseModel, Chat with the AEGIS disaster-assessment assistant.      Pass `session_id` to c, Inject persisted report/analysis context into the system prompt., get_report(), list_reports(), List all reports, optionally filtered by video_id., Generate and persist a disaster assessment report from a video.      Reuses ca, Fetch a previously generated report by its ID. (+14 more)

### Community 3 - "Community 3"
Cohesion: 0.22
Nodes (21): _detections_from_row(), Serve the extracted JPEG for a frame (1-based file names on disk)., Return cached frame analyses for a previously analyzed video., Analyze an uploaded video frame-by-frame.      Returns cached results if the vid, _row_to_frame_analysis(), Enum, AnalyzeResponse, DamageSeverity (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.27
Nodes (7): run(), main(), _probe(), probe_duration_seconds(), Resolve an ffmpeg-family executable across local dev and container setups., _resolve_binary(), _run_ffmpeg()

### Community 5 - "Community 5"
Cohesion: 0.39
Nodes (6): deriveAssessments(), formatDate(), locationLabel(), reportToListItem(), severityToLevel(), shortId()

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (3): buildMockReport(), nowIso(), withMockVisuals()

### Community 7 - "Community 7"
Cohesion: 0.38
Nodes (4): FitBounds(), Marker(), useMap(), ProvinceLayers()

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (3): cleanupVideo(), onSeeked(), load()

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 0.33
Nodes (1): runAnalysis()

### Community 12 - "Community 12"
Cohesion: 0.4
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 0.7
Nodes (4): buildFileStem(), downloadReportJson(), downloadReportPdf(), triggerDownload()

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (2): BaseSettings, Settings

### Community 15 - "Community 15"
Cohesion: 0.83
Nodes (3): aggregate_severity(), _recommend(), summarize()

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (2): severityMeta(), ToastRow()

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (2): buildHeader(), filenameToTitle()

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
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (0): 

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
Nodes (0): 

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **3 isolated node(s):** `Localized damage region on the frame (object-detection style). Coordinates are n`, `Resolve an ffmpeg-family executable across local dev and container setups.`, `Extract one frame every `interval_seconds` from the video.      Returns the or`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 23`** (2 nodes): `main.py`, `health()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `App()`, `App.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `VideoUpload.tsx`, `VideoUpload()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `AppShell()`, `AppShell.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `MapContextPanel.tsx`, `MapContextPanel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `TopNav.tsx`, `handlePointerDown()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `DroneConnect.tsx`, `handleConnect()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `FrameAnalysisFeed.tsx`, `damageToSeverityLevel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `OverallAssessment.tsx`, `countBySeverity()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `ProgressBar.tsx`, `clampPercent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (2 nodes): `compress.ts`, `compressVideo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (2 nodes): `DashboardPage.tsx`, `DashboardPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `ProfilePage.tsx`, `ProfilePage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (2 nodes): `main()`, `build.rs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `vite.config.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `main.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `ReportPreviewCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `ReportsList.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `DetailedInsights.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `supabase.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `NotificationsPage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Map()` connect `Community 0` to `Community 5`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `get_supabase()` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `generate_report()` connect `Community 1` to `Community 2`, `Community 3`, `Community 15`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `get_supabase()` (e.g. with `_load_cached_frames()` and `_persist_frames()`) actually correct?**
  _`get_supabase()` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `Map()` (e.g. with `ReportView()` and `deriveAssessments()`) actually correct?**
  _`Map()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `chat()` (e.g. with `get_supabase()` and `chat_completion()`) actually correct?**
  _`chat()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `generate_report()` (e.g. with `get_supabase()` and `_load_cached_frames()`) actually correct?**
  _`generate_report()` has 9 INFERRED edges - model-reasoned connections that need verification._