# AEGIS

**AI-powered disaster assessment desktop application.**

AEGIS ingests aerial or ground video of a disaster site, extracts frames, analyzes each frame with a local vision-language model (**Gemma 3 4B via Ollama**), aggregates the analyses into a structured damage report, and exposes the findings through an interactive map, a report panel, and a conversational AI assistant — all in a native desktop shell powered by **Tauri v2**.

> This `README.md` is the technical source of truth for the current repository and documents the Tauri + FastAPI implementation that exists today. For the broader hackathon pitch, stakeholder framing, and target-product narrative, see `AEGIS_Project_Summary.docx`; that document describes proposal context rather than a literal snapshot of the current codebase.

---

## Table of contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Monorepo layout](#monorepo-layout)
4. [Tech stack](#tech-stack)
5. [Prerequisites](#prerequisites)
6. [Setup](#setup)
   - [1. Clone & install](#1-clone--install)
   - [2. Configure environment](#2-configure-environment)
   - [3. Run Ollama + pull Gemma 3](#3-run-ollama--pull-gemma-3)
   - [4. Run the backend](#4-run-the-backend)
   - [5. Run the desktop app](#5-run-the-desktop-app)
7. [Run with Docker](#run-with-docker)
8. [Mock VLM mode (development)](#mock-vlm-mode-development)
9. [API reference](#api-reference)
10. [Supabase schema](#supabase-schema)
11. [Environment variables](#environment-variables)
12. [Scripts](#scripts)
13. [Project structure (full)](#project-structure-full)
14. [Troubleshooting](#troubleshooting)
15. [Roadmap](#roadmap)
16. [License](#license)

---

## Features

- 🎞️ **Video ingest** — drag-and-drop `.mp4/.mov/.webm` into the desktop app; backend stores it and returns a `video_id`.
- 🧠 **Local VLM analysis** — every N seconds of video is sampled as a JPEG and passed to **Gemma 3 4B** via Ollama. The model returns structured JSON (severity, description, hazards, confidence).
- 🗺️ **Interactive map** — site location rendered on a MapLibre GL map (CARTO dark basemap) with severity-coded markers.
- 📄 **Structured report** — per-site damage summary, key findings, and prioritized recommendations computed from frame-level analyses.
- 💬 **Conversational AI** — ask follow-up questions about the current report; chat is grounded via the same Gemma 3 model.
- 🗄️ **Supabase-ready integration** — frontend and backend clients are wired for Supabase, and persistence can be enabled as the API routers are connected.
- 🖥️ **Native desktop UX** — Tauri v2 produces a small cross-platform binary (Windows / macOS / Linux).

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        AEGIS Desktop (Tauri v2)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ VideoUpload  │  │   MapView    │  │ Report+Chat  │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         └────────────── React + TS + SWC + Tailwind ───────────► │
└──────────────────────┬─────────────────────────┬─────────────────┘
                       │  HTTP (fetch)           │  WS (Supabase)
                       ▼                         ▼
        ┌──────────────────────────┐   ┌──────────────────────┐
        │    FastAPI backend       │   │      Supabase        │
        │ /upload  /analyze        │   │   Postgres + Auth    │
        │ /report  /chat           │◄──┤   Storage (optional) │
        └───────┬──────────────────┘   └──────────────────────┘
                │
                ├─► ffmpeg-python  (frame extraction)
                └─► ollama client  (Gemma 3 4B VLM)
```

---

## Monorepo layout

```
aegis/
├── apps/
│   ├── desktop/         Tauri v2 + React + TypeScript + Vite (SWC) + Tailwind + MapLibre GL
│   └── api/             FastAPI backend (upload, analyze, report, chat)
├── package.json         npm workspace root
├── README.md            ← you are here
└── .gitignore
```

---

## Tech stack

### Desktop (`apps/desktop`)

| Layer     | Choice                                                  |
| --------- | ------------------------------------------------------- |
| Shell     | Tauri v2 (Rust)                                         |
| UI        | React 18 + TypeScript                                   |
| Bundler   | Vite 5 with `@vitejs/plugin-react-swc` (SWC, not Babel) |
| Styling   | Tailwind CSS 3                                          |
| Maps      | MapLibre GL (`maplibre-gl`) + CARTO raster/GL basemaps  |
| Data      | `@supabase/supabase-js`                                 |
| API calls | `fetch` wrapper in `src/lib/api.ts`                     |

### API (`apps/api`)

| Layer     | Choice                                        |
| --------- | --------------------------------------------- |
| Framework | FastAPI                                       |
| Schemas   | Pydantic v2 (+ `pydantic-settings` for env)   |
| Server    | Uvicorn                                       |
| DB / Auth | Supabase (`supabase-py`)                      |
| VLM       | `z.ai` Python client → `glm-4.6v-flash`       |
| Video     | `ffmpeg-python` (requires `ffmpeg` on `PATH`) |

---

## Prerequisites

- **Node.js 20+** and **npm**
- **Rust (stable)** + the Tauri v2 OS prerequisites — see https://v2.tauri.app/start/prerequisites/
  - Windows: Microsoft C++ Build Tools + WebView2
  - macOS: Xcode Command Line Tools
  - Linux: `webkit2gtk-4.1`, `libssl-dev`, etc.
- **Python 3.11+**
- **FFmpeg** on `PATH` — used by `ffmpeg-python`
  - Windows: `winget install Gyan.FFmpeg`
  - macOS: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg`
- **Ollama** running locally — https://ollama.com
  _Optional for development._ If your machine can't run Gemma 3 locally, skip Ollama and use [Mock VLM mode](#mock-vlm-mode-development).
- A **Supabase** project (URL + anon key for the frontend, service-role or anon key for the backend)

---

## Setup

### 1. Clone & install

```bash
git clone <your-repo-url> aegis
cd aegis

# Frontend (installs into apps/desktop via npm workspaces)
npm install

# Backend
cd apps/api
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
cd ../..
```

### 2. Configure environment

```bash
cp apps/api/.env.example     apps/api/.env
cp apps/desktop/.env.example apps/desktop/.env
```

Fill in the Supabase and Ollama values — see [Environment variables](#environment-variables).

### 3. Run Ollama + pull Gemma 3

```bash
# Install from https://ollama.com, then:
ollama serve                 # or run the desktop app, which starts the server
ollama pull gemma3:4b
# Sanity check:
ollama run gemma3:4b "Hello"
```

Ollama listens on `http://localhost:11434` by default.

### 4. Run the backend

```bash
cd apps/api
# activate venv (see step 1)
uvicorn main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**. Interactive OpenAPI docs live at **http://localhost:8000/docs**.

### 5. Run the desktop app

In a **separate** terminal:

```bash
cd apps/desktop
npm run tauri dev
```

The Tauri shell launches with Vite on `http://localhost:1420`. Hot-reload works for the React frontend; Rust changes trigger a rebuild.

To build a distributable:

```bash
cd apps/desktop
npm run tauri build
```

Output appears under `apps/desktop/src-tauri/target/release/bundle/`.

> **First-time Tauri note:** generate real icons before `tauri build` — see `apps/desktop/src-tauri/icons/README.md`.

---

## Run with Docker

The **backend API** and **Ollama** can run fully containerized via Docker Compose. The Tauri desktop app is a native GUI and still runs on your host — point it at the containerized API.

### Prerequisites

- **Docker Desktop** (Windows/macOS) or Docker Engine + Compose plugin (Linux)
- (Optional) **NVIDIA Container Toolkit** if you want GPU-accelerated Ollama

### 1. Configure environment

From the repo root:

```bash
cp .env.example .env
```

Edit `.env` and fill in `SUPABASE_URL` / `SUPABASE_KEY` if you want persistence. The default `VLM_MODE=mock` lets the stack boot without pulling a multi-GB model.

### 2. Build & start

```bash
docker compose up --build
```

This starts two services:

| Service  | Port    | Purpose                              |
| -------- | ------- | ------------------------------------ |
| `api`    | `8000`  | FastAPI backend (includes ffmpeg)    |
| `ollama` | `11434` | Ollama server, persisted to a volume |

Verify:

```bash
curl http://localhost:8000/health
# {"status":"ok","model":"gemma3:4b"}
```

### 3. (Real VLM mode) pull the model

Only needed if `VLM_MODE=real`:

```bash
docker compose exec ollama ollama pull gemma3:4b
```

Set `VLM_MODE=real` in `.env`, then `docker compose up -d` again.

### 4. Point the desktop app at the container

In `apps/desktop/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Then `npm run tauri dev` on your host as usual.

### GPU (optional)

Uncomment the `deploy.resources.reservations.devices` block under the `ollama` service in `docker-compose.yml` to enable NVIDIA GPU passthrough.

### Common commands

```bash
docker compose up --build       # build + start, foreground
docker compose up -d            # start detached
docker compose logs -f api      # tail API logs
docker compose down             # stop and remove containers
docker compose down -v          # also wipe uploads/frames + ollama models
```

### Volumes

- `api-data` → `/data` inside the API container; holds `uploads/` and `frames/`.
- `ollama-data` → `/root/.ollama` inside the Ollama container; holds pulled models.

---

## Mock VLM mode (development)

Running Gemma 3 4B locally needs a capable GPU/CPU and several gigabytes of RAM. If your dev machine can't spare it, run the backend in **mock mode** — the VLM is replaced with a deterministic stub that returns canned `FrameAnalysis` objects and chat replies. No Ollama, no model download, no GPU.

Mock mode lets you build and test everything that _isn't_ the model: the upload pipeline, frame extraction, report aggregation, map markers, chat UI, Supabase wiring, CORS, etc.

### Enable it

Set `VLM_MODE=mock` in `apps/api/.env`:

```env
VLM_MODE=mock
```

Then run the backend as usual (`uvicorn main:app --reload --port 8000`). You can leave `OLLAMA_HOST` and `VLM_MODEL` unset — they're ignored in mock mode.

### What the stub returns

- **`/analyze`** — each frame is assigned a severity/description/hazards bucket deterministically hashed from the frame filename + index, so the same video produces the same output on every run. Confidence values range `0.5`–`0.9`.
- **`/chat`** — returns a short canned reply that echoes the last user message and reminds you mock mode is on.

The stub lives in `apps/api/app/services/vlm.py` (see `_mock_frame_analysis` and the `vlm_mode == "mock"` branches). Edit the `_MOCK_*` tables there to tweak the fake outputs.

### Switching back to the real model

Set `VLM_MODE=real` (or remove the line — `real` is the default), make sure Ollama is running and `gemma3:4b` is pulled, then restart the backend. No frontend changes are needed.

### When you still need the real model

Mock mode is useful for frontend/backend iteration, CI, and demos that don't need accurate analysis. Use the real model (locally or pointed at a remote Ollama via `OLLAMA_HOST`) whenever you're evaluating model quality, tuning prompts, or validating end-to-end behaviour before a release.

---

## z.ai VLM mode (cloud)

If you don't want to run a local VLM, you can route `/analyze` and `/chat` to [z.ai](https://docs.z.ai/)'s OpenAI-compatible vision endpoint instead.

### Enable it

In `apps/api/.env` (or the Compose `.env`):

```env
VLM_MODE=zai
VLM_MODEL=glm-4.5v          # confirm the exact tag in z.ai's model list
ZAI_API_KEY=your-z-ai-key
ZAI_BASE_URL=https://api.z.ai/api/paas/v4
```

Then restart the API. No Ollama required.

### How it works

Each frame is read from disk, base64-encoded, and sent as an `image_url` content block to the z.ai chat-completions endpoint; the response is parsed with the same JSON schema as the Ollama path. Chat requests are forwarded as plain text messages. The integration lives in `apps/api/app/services/vlm.py` behind the `vlm_mode == "zai"` branches.

### Notes

- The `openai` Python SDK is used purely as an OpenAI-compatible HTTP client — no OpenAI account is involved.
- Verify the vision-model tag you want (`glm-4.5v`, `glm-4v-plus`, `glm-4v`, etc.) in z.ai's docs before setting `VLM_MODEL`.
- Keep `ZAI_API_KEY` out of `apps/desktop/.env`; all VLM calls go through the backend.

---

## API reference

All routes return JSON. Schemas are Pydantic v2 models defined in `apps/api/app/schemas.py`.

### `POST /upload`

Upload a disaster-site video.

| Field  | Type           | Notes                  |
| ------ | -------------- | ---------------------- |
| `file` | multipart file | `video/*` content-type |

**Response** (`201`):

```json
{
  "video_id": "a1b2c3...",
  "filename": "drone.mp4",
  "size_bytes": 48219301,
  "content_type": "video/mp4",
  "created_at": "2026-04-13T12:00:00Z"
}
```

### `POST /analyze`

Extract frames and run Gemma 3 on each.

**Request:**

```json
{
  "video_id": "a1b2c3...",
  "frame_interval_seconds": 2,
  "location": { "lat": 37.7749, "lng": -122.4194 }
}
```

**Response:**

```json
{
  "video_id": "a1b2c3...",
  "frame_count": 14,
  "frames": [
    {
      "frame_index": 0,
      "timestamp_seconds": 0.0,
      "severity": "severe",
      "description": "Collapsed roof with exposed rebar.",
      "detected_hazards": ["structural collapse", "exposed rebar"],
      "confidence": 0.82
    }
  ]
}
```

### `POST /report`

Generate a structured report by re-running analysis and aggregating.

**Request:**

```json
{
  "video_id": "a1b2c3...",
  "location": { "lat": 37.7749, "lng": -122.4194 },
  "incident_type": "earthquake"
}
```

**Response:** a `Report` object — see `schemas.py::Report`.

### `POST /chat`

Conversational Q&A, grounded (optionally) by a `report_id` or `video_id`.

**Request:**

```json
{
  "report_id": "r_abc",
  "messages": [
    { "role": "user", "content": "What's the biggest risk on this site?" }
  ]
}
```

**Response:**

```json
{ "message": { "role": "assistant", "content": "..." } }
```

### `GET /health`

Returns `{"status":"ok","model":"gemma3:4b"}`.

---

## Supabase schema

A minimal schema that matches the backend's object model. Apply via the Supabase SQL editor.

```sql
create table if not exists videos (
  id uuid primary key,
  filename text not null,
  size_bytes bigint not null,
  content_type text,
  created_at timestamptz not null default now()
);

create table if not exists frame_analyses (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos(id) on delete cascade,
  frame_index int not null,
  timestamp_seconds double precision not null,
  severity text not null,
  description text not null,
  detected_hazards text[] not null default '{}',
  confidence double precision not null,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key,
  video_id uuid not null references videos(id) on delete cascade,
  summary text not null,
  overall_severity text not null,
  key_findings text[] not null default '{}',
  recommendations text[] not null default '{}',
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);
```

Persisting into Supabase is scaffolded via `apps/api/app/db.py` (`get_supabase()`); wire it into the routers as needed.

---

## Environment variables

### `apps/api/.env`

| Var                      | Default                  | Purpose                                                                                                           |
| ------------------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_URL`           | —                        | Supabase project URL                                                                                              |
| `SUPABASE_KEY`           | —                        | Service-role or anon key                                                                                          |
| `OLLAMA_HOST`            | `http://localhost:11434` | Ollama HTTP endpoint                                                                                              |
| `VLM_MODE`               | `real`                   | `real` calls Ollama; `mock` returns canned frame/chat responses — see [Mock VLM mode](#mock-vlm-mode-development) |
| `VLM_MODEL`              | `gemma3:4b`              | Ollama model tag                                                                                                  |
| `UPLOAD_DIR`             | `./uploads`              | Where uploaded videos are stored                                                                                  |
| `FRAMES_DIR`             | `./frames`               | Where extracted frames are stored                                                                                 |
| `FRAME_INTERVAL_SECONDS` | `2`                      | Seconds between sampled frames                                                                                    |

### `apps/desktop/.env`

| Var                 | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `VITE_SUPABASE_URL` | Supabase project URL (client-side)       |
| `VITE_SUPABASE_KEY` | Supabase **anon** key (client-side only) |
| `VITE_API_URL`      | Base URL of the FastAPI backend          |

> Never put a Supabase service-role key in `VITE_*` — those are bundled into the client.

---

## Scripts

From the repo root:

```bash
npm run dev:desktop      # tauri dev (launches React + Rust shell)
npm run build:desktop    # tauri build (produces native installer)
npm run dev:api          # prints the uvicorn command to run
```

From `apps/desktop`:

```bash
npm run dev              # Vite only (no Tauri shell)
npm run build            # tsc -b && vite build
npm run tauri dev|build  # full Tauri dev / production builds
```

From `apps/api`:

```bash
uvicorn main:app --reload --port 8000
```

---

## Project structure (full)

```
aegis/
├── README.md
├── .gitignore
├── package.json
└── apps/
    ├── api/
    │   ├── .env.example
    │   ├── pyproject.toml
    │   ├── requirements.txt
    │   ├── main.py
    │   └── app/
    │       ├── __init__.py
    │       ├── config.py              # pydantic-settings
    │       ├── schemas.py             # pydantic v2 models
    │       ├── db.py                  # supabase client factory
    │       ├── services/
    │       │   ├── video.py           # ffmpeg-python frame extraction
    │       │   ├── vlm.py             # ollama client → gemma3:4b
    │       │   └── report.py          # aggregation / recommendations
    │       └── routers/
    │           ├── upload.py
    │           ├── analyze.py
    │           ├── report.py
    │           └── chat.py
    └── desktop/
        ├── .env.example
        ├── package.json
        ├── vite.config.ts             # @vitejs/plugin-react-swc
        ├── tailwind.config.js
        ├── postcss.config.js
        ├── tsconfig.json
        ├── tsconfig.node.json
        ├── index.html
        ├── src/
        │   ├── main.tsx
        │   ├── App.tsx
        │   ├── index.css
        │   ├── vite-env.d.ts
        │   ├── lib/
        │   │   ├── api.ts
        │   │   └── supabase.ts
        │   └── components/
        │       ├── VideoUpload.tsx
        │       ├── Map.tsx
        │       ├── Report.tsx
        │       └── Chat.tsx
        └── src-tauri/
            ├── Cargo.toml
            ├── tauri.conf.json
            ├── build.rs
            ├── capabilities/default.json
            ├── icons/README.md
            └── src/
                ├── main.rs
                └── lib.rs
```

---

## Troubleshooting

**`ollama: pull model manifest: file does not exist`**
Run `ollama --version`; you need Ollama ≥ 0.3.0 for `gemma3:4b`. Upgrade if older.

**`ffmpeg.Error` during `/analyze`**
Ensure `ffmpeg` is on `PATH`: `ffmpeg -version` should print a version. On Windows, reopen your shell after installing.

**Tauri: "icon file missing"**
Generate icons: `npx @tauri-apps/cli icon path/to/source.png` from `apps/desktop`.

**CORS errors from the desktop app**
Add your frontend origin to `cors_origins` in `apps/api/app/config.py`. Tauri's dev URL is `http://localhost:1420` and `tauri://localhost` in production.

**Supabase credentials errors on first API call**
`SUPABASE_URL`/`SUPABASE_KEY` are validated lazily via `get_supabase()`. Confirm `.env` is in `apps/api/` (not the repo root) and that the venv is active.

**Gemma 3 returns non-JSON**
`/analyze` falls back to a safe default. If it happens often, confirm you're using the `:4b` tag (the `:1b` model's instruction following is weaker) and that `format="json"` is supported by your Ollama version.

---

## Roadmap

This checklist tracks likely next implementation steps for the current repo. It is separate from the hackathon-specific milestones described in `AEGIS_Project_Summary.docx`.

- [ ] Persist uploads/analyses/reports into Supabase tables on write
- [ ] Stream `/analyze` progress via SSE/WebSocket so the UI can show per-frame progress
- [ ] Per-frame map pins (not just site-level) using EXIF or GPS overlay
- [ ] PDF export of reports
- [ ] Offline frame cache so re-runs don't re-extract
- [ ] Auth via Supabase (multi-user deployments)

---

## License

MIT — see `LICENSE` if present, otherwise this project is provided as-is for evaluation.
