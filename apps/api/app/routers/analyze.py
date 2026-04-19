from datetime import datetime, timezone
from functools import lru_cache
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from postgrest.exceptions import APIError

from app.config import settings
from app.db import get_supabase
from app.schemas import AnalyzeRequest, AnalyzeResponse, DamageSeverity, Detection, FrameAnalysis
from app.services.storage import download_to_temp
from app.services.video import extract_frames
from app.services.vlm import analyze_frame

router = APIRouter(prefix="/analyze", tags=["analyze"])


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
        detections=_detections_from_row(row),
    )


def _with_image_urls(video_id: str, frames: list[FrameAnalysis]) -> list[FrameAnalysis]:
    return [
        f.model_copy(
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


@router.get("/{video_id}/frame/{frame_index}.jpg")
def get_frame_image(video_id: str, frame_index: int) -> FileResponse:
    """Serve the extracted JPEG for a frame (1-based file names on disk)."""
    path = settings.frames_dir / video_id / f"frame_{frame_index + 1:05d}.jpg"
    if not path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"frame file not found for video_id={video_id} index={frame_index}",
        )
    return FileResponse(path, media_type="image/jpeg")


@router.get("/{video_id}", response_model=AnalyzeResponse)
def get_analysis(video_id: str) -> AnalyzeResponse:
    """Return cached frame analyses for a previously analyzed video."""
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


@router.post("", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    """
    Analyze an uploaded video frame-by-frame.

    Returns cached results if the video has already been analyzed at the same
    interval. Pass a different `frame_interval_seconds` to force re-analysis.
    """
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

    interval = req.frame_interval_seconds or settings.frame_interval_seconds

    # Return cached frames when the client uses the default interval
    if req.frame_interval_seconds is None:
        cached = _load_cached_frames(req.video_id)
        if cached:
            hydrated = _with_image_urls(req.video_id, cached)
            return AnalyzeResponse(
                video_id=req.video_id,
                frame_count=len(hydrated),
                frames=hydrated,
            )

    storage_path: str = video_row.data["storage_path"]
    filename: str = video_row.data["filename"]
    suffix = ("." + filename.rsplit(".", 1)[-1]) if "." in filename else ""

    video_path = download_to_temp(storage_path, suffix)
    try:
        frame_paths = extract_frames(video_path, req.video_id, interval_seconds=interval)
        analyses = [
            analyze_frame(
                frame_path=p,
                frame_index=i,
                timestamp_seconds=i * interval,
            )
            for i, p in enumerate(frame_paths)
        ]
    finally:
        video_path.unlink(missing_ok=True)

    _persist_frames(req.video_id, analyses)

    out_frames = _with_image_urls(req.video_id, analyses)
    return AnalyzeResponse(
        video_id=req.video_id,
        frame_count=len(out_frames),
        frames=out_frames,
    )
