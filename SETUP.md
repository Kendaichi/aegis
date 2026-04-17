# AEGIS — Quick Setup Guide

This guide covers what the desktop expects from the API and the minimum config needed to get both running.

---

## API Endpoints

The desktop (`src/lib/api.ts`) calls four routes. The API already implements all of them:

| Desktop call     | API router              | Status      |
|------------------|-------------------------|-------------|
| `POST /upload`   | `routers/upload.py`     | Implemented |
| `POST /analyze`  | `routers/analyze.py`    | Implemented |
| `POST /report`   | `routers/report.py`     | Implemented |
| `POST /chat`     | `routers/chat.py`       | Implemented |

---

## 1. Configure `apps/api/.env`

Copy the example file first:

```bash
cp apps/api/.env.example apps/api/.env
```

The only required decision is which VLM backend to use:

### Option A — Mock (no external dependencies, fastest to start)

```env
VLM_MODE=mock
```

No Ollama, no model download, no GPU needed. Returns deterministic canned responses. Good for UI development.

### Option B — Ollama (local, free)

```env
VLM_MODE=real
OLLAMA_HOST=http://localhost:11434
VLM_MODEL=gemma3:4b
```

Requires Ollama installed and the model pulled:

```bash
ollama pull gemma3:4b
```

Use a vision-capable model (`gemma3:4b`, `llava`, etc.).

### Option C — z.ai cloud

```env
VLM_MODE=zai
ZAI_API_KEY=your-key-here
ZAI_BASE_URL=https://api.z.ai/api/paas/v4
VLM_MODEL=glm-4v          # verify the exact tag at docs.z.ai
```

No local model required. All VLM calls go through the backend — never expose `ZAI_API_KEY` in the desktop `.env`.

---

## 2. Configure `apps/desktop/.env`

Copy the example file first:

```bash
cp apps/desktop/.env.example apps/desktop/.env
```

```env
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK_API=false     # set true to skip the API entirely (frontend mock only)
```

---

## 3. Supabase (optional for now)

Both `.env.example` files include `SUPABASE_URL` / `SUPABASE_KEY`, but none of the API routers currently write to Supabase — everything is stateless (files on disk). The desktop has `supabase.ts` but it is not wired into `api.ts` yet.

**You can leave these blank to start.** Add them when you are ready to enable persistence.

> Never put a service-role key in a `VITE_*` variable — those are bundled into the client.

---

## 4. Runtime dependency — FFmpeg

The API uses `ffmpeg-python` to extract frames from uploaded videos. Make sure `ffmpeg` is on your `PATH`:

```bash
ffmpeg -version
```

If it is missing:

| OS      | Install command                  |
|---------|----------------------------------|
| Windows | `winget install Gyan.FFmpeg`     |
| macOS   | `brew install ffmpeg`            |
| Linux   | `sudo apt install ffmpeg`        |

---

## Quickstart (mock mode, no GPU)

```bash
# 1. API
cd apps/api
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt

# Set VLM_MODE=mock in apps/api/.env, then:
uvicorn main:app --reload --port 8000

# 2. Desktop (separate terminal)
cd apps/desktop
npm install
npm run tauri dev
```

API docs available at **http://localhost:8000/docs** once the backend is running.
