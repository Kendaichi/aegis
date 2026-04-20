import asyncio
import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from fastapi.responses import FileResponse, StreamingResponse
from postgrest.exceptions import APIError

from app.config import settings
from app.db import get_supabase
from app.schemas import (
    AnalyzeJobResponse,
    AnalyzeRequest,
    AnalyzeResponse,
    DamageSeverity,
    Detection,
    FrameAnalysis,
)
from app.services.storage import download_to_temp, upload_frame_jpeg
from app.services.video import extract_frames
from app.services.vlm import analyze_frame

router = APIRouter(prefix="/analyze", tags=["analyze"])

_INTER_FRAME_DELAY = 2.0  # seconds between VLM API calls to avoid rate limits


@dataclass
class _AnalysisJob:
    frames: list[FrameAnalysis] = field(default_factory=list)
    done: bool = False
    error: str | None = None
    event: asyncio.Event = field(default_factory=asyncio.Event)


_active_jobs: dict[str, _AnalysisJob] = {}


def _is_missing_column_error(exc: APIError, column: str) -> bool:
    payload = exc.args[0] if exc.args else {}
    if isinstance(payload, dict):
        code = str(payload.get("code", ""))
        message = str(payload.get("message", ""))
        return code == "PGRST204" and column in message
    return False


def _serialize_frame_analyses(
    video_id: str,
    analyses: list[FrameAnalysis],
    *,
    include_detections: bool,
) -> list[dict]:
    rows: list[dict] = []
    for f in analyses:
        row = {
            "video_id": video_id,
            "frame_index": f.frame_index,
            "timestamp_seconds": f.timestamp_seconds,
            "severity": f.severity.value,
            "description": f.description,
            "detected_hazards": f.detected_hazards,
            "confidence": f.confidence,
            "image_url": f.image_url,
            "access_route_status": f.access_route_status,
            "resource_recommendations": f.resource_recommendations,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        if include_detections:
            row["detections"] = [d.model_dump(mode="json") for d in f.detections]
        rows.append(row)
    return rows


def _detections_from_row(row: dict) -> list[Detection]:
    raw = row.get("detections")
    if not raw or not isinstance(raw, list):
        return []
    out: list[Detection] = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        bbox = item.get("bbox")
        if not isinstance(bbox, (list, tuple)) or len(bbox) != 4:
            continue
        try:
            out.append(
                Detection(
                    label=str(item.get("label", "damage"))[:240],
                    severity=DamageSeverity(str(item.get("severity", "none"))),
                    bbox=(float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3])),
                    confidence=float(item.get("confidence", 0.5)),
                )
            )
        except (ValueError, TypeError):
            continue
    return out


def _row_to_frame_analysis(row: dict) -> FrameAnalysis:
    return FrameAnalysis(
        frame_index=row["frame_index"],
        timestamp_seconds=row["timestamp_seconds"],
        severity=DamageSeverity(str(row["severity"])),
        description=row["description"],
        detected_hazards=row["detected_hazards"] or [],
        confidence=row["confidence"],
        image_url=row.get("image_url"),
        access_route_status=row.get("access_route_status", "unknown"),
        resource_recommendations=row.get("resource_recommendations") or [],
        detections=_detections_from_row(row),
    )


def _with_image_urls(video_id: str, frames: list[FrameAnalysis]) -> list[FrameAnalysis]:
    return [
        f
        if f.image_url
        else f.model_copy(
            update={"image_url": f"/analyze/{video_id}/frame/{f.frame_index}.jpg"},
        )
        for f in frames
    ]


@lru_cache(maxsize=256)
def _load_cached_frames(video_id: str) -> list[FrameAnalysis] | None:
    sb = get_supabase()
    result = (
        sb.table("frame_analyses")
        .select("*")
        .eq("video_id", video_id)
        .order("frame_index")
        .execute()
    )
    if not result.data:
        return None
    return [_row_to_frame_analysis(row) for row in result.data]


def _persist_frames(video_id: str, analyses: list[FrameAnalysis]) -> None:
    sb = get_supabase()
    sb.table("frame_analyses").delete().eq("video_id", video_id).execute()
    _load_cached_frames.cache_clear()
    rows = _serialize_frame_analyses(video_id, analyses, include_detections=True)
    try:
        sb.table("frame_analyses").insert(rows).execute()
    except APIError as exc:
        if not _is_missing_column_error(exc, "detections"):
            raise
        fallback_rows = _serialize_frame_analyses(video_id, analyses, include_detections=False)
        sb.table("frame_analyses").insert(fallback_rows).execute()


async def _run_analysis_job(
    video_id: str,
    storage_path: str,
    suffix: str,
    interval: float,
) -> None:
    job = _active_jobs[video_id]
    raw_frames: list[FrameAnalysis] = []
    try:
        video_path: Path = await asyncio.to_thread(download_to_temp, storage_path, suffix)
        try:
            frame_paths: list[Path] = await asyncio.to_thread(
                extract_frames, video_path, video_id, interval
            )
        finally:
            video_path.unlink(missing_ok=True)

        for i, p in enumerate(frame_paths):
            frame = await asyncio.to_thread(
                analyze_frame,
                frame_path=p,
                frame_index=i,
                timestamp_seconds=i * interval,
            )
            try:
                jpeg_bytes = p.read_bytes()
                public_url = await asyncio.to_thread(upload_frame_jpeg, video_id, i, jpeg_bytes)
                frame = frame.model_copy(update={"image_url": public_url})
            except Exception:
                frame = frame.model_copy(update={"image_url": f"/analyze/{video_id}/frame/{i}.jpg"})
            raw_frames.append(frame)
            job.frames.append(frame)
            job.event.set()
            if i < len(frame_paths) - 1:
                await asyncio.sleep(_INTER_FRAME_DELAY)

        await asyncio.to_thread(_persist_frames, video_id, raw_frames)
    except Exception as exc:
        job.error = str(exc)
        job.event.set()
    finally:
        job.done = True
        job.event.set()
        # Keep job in memory briefly so late SSE clients can still connect
        await asyncio.sleep(300)
        _active_jobs.pop(video_id, None)


@router.get("/{video_id}/frame/{frame_index}.jpg")
def get_frame_image(video_id: str, frame_index: int) -> FileResponse:
    path = settings.frames_dir / video_id / f"frame_{frame_index + 1:05d}.jpg"
    if not path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"frame file not found for video_id={video_id} index={frame_index}",
        )
    return FileResponse(path, media_type="image/jpeg")


@router.get("/{video_id}/stream")
async def stream_analysis(video_id: str) -> StreamingResponse:
    # If no active job, serve from cache
    if video_id not in _active_jobs:
        cached = _load_cached_frames(video_id)
        if not cached:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No active job or cached results for video_id {video_id}",
            )
        hydrated = _with_image_urls(video_id, cached)

        async def cached_stream():
            for frame in hydrated:
                yield f"event: frame\ndata: {frame.model_dump_json()}\n\n"
            yield "event: done\ndata: {}\n\n"

        return StreamingResponse(
            cached_stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    job = _active_jobs[video_id]

    async def live_stream():
        sent = 0
        while True:
            while sent < len(job.frames):
                yield f"event: frame\ndata: {job.frames[sent].model_dump_json()}\n\n"
                sent += 1

            if job.error:
                yield f"event: error\ndata: {json.dumps({'detail': job.error})}\n\n"
                return

            if job.done:
                yield "event: done\ndata: {}\n\n"
                return

            job.event.clear()
            # Re-check after clear to avoid missing an update that arrived between drain and clear
            while sent < len(job.frames):
                yield f"event: frame\ndata: {job.frames[sent].model_dump_json()}\n\n"
                sent += 1
            if job.done or job.error:
                continue

            try:
                await asyncio.wait_for(job.event.wait(), timeout=120)
            except asyncio.TimeoutError:
                yield 'event: error\ndata: {"detail": "analysis timed out"}\n\n'
                return

    return StreamingResponse(
        live_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/{video_id}", response_model=AnalyzeResponse)
def get_analysis(video_id: str) -> AnalyzeResponse:
    sb = get_supabase()
    video_row = (
        sb.table("videos").select("video_id").eq("video_id", video_id).maybe_single().execute()
    )
    if not video_row.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"video_id {video_id} not found",
        )
    frames_raw = _load_cached_frames(video_id) or []
    frames = _with_image_urls(video_id, frames_raw)
    return AnalyzeResponse(video_id=video_id, frame_count=len(frames), frames=frames)


@router.post("", response_model=AnalyzeJobResponse)
async def analyze(req: AnalyzeRequest, background_tasks: BackgroundTasks) -> AnalyzeJobResponse:
    sb = get_supabase()
    video_row = (
        sb.table("videos")
        .select("storage_path, filename")
        .eq("video_id", req.video_id)
        .maybe_single()
        .execute()
    )
    if not video_row.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"video_id {req.video_id} not found",
        )

    # Return cached results if available and no custom interval requested
    if req.frame_interval_seconds is None:
        cached = _load_cached_frames(req.video_id)
        if cached:
            hydrated = _with_image_urls(req.video_id, cached)
            return AnalyzeJobResponse(
                video_id=req.video_id,
                status="complete",
                frame_count=len(hydrated),
                frames=hydrated,
            )

    # Return current job state if already running
    if req.video_id in _active_jobs:
        job = _active_jobs[req.video_id]
        return AnalyzeJobResponse(
            video_id=req.video_id,
            status="processing",
            frame_count=len(job.frames),
            frames=list(job.frames),
        )

    # Start new background job
    interval = req.frame_interval_seconds or settings.frame_interval_seconds
    storage_path: str = video_row.data["storage_path"]
    filename: str = video_row.data["filename"]
    suffix = ("." + filename.rsplit(".", 1)[-1]) if "." in filename else ""

    _active_jobs[req.video_id] = _AnalysisJob()
    background_tasks.add_task(_run_analysis_job, req.video_id, storage_path, suffix, interval)

    return AnalyzeJobResponse(video_id=req.video_id, status="processing")
