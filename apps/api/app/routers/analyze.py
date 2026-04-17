from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status

from app.config import settings
from app.db import get_supabase
from app.schemas import AnalyzeRequest, AnalyzeResponse, FrameAnalysis
from app.services.storage import download_to_temp
from app.services.video import extract_frames
from app.services.vlm import analyze_frame

router = APIRouter(prefix="/analyze", tags=["analyze"])


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
    return [
        FrameAnalysis(
            frame_index=row["frame_index"],
            timestamp_seconds=row["timestamp_seconds"],
            severity=row["severity"],
            description=row["description"],
            detected_hazards=row["detected_hazards"] or [],
            confidence=row["confidence"],
        )
        for row in result.data
    ]


def _persist_frames(video_id: str, analyses: list[FrameAnalysis]) -> None:
    sb = get_supabase()
    sb.table("frame_analyses").delete().eq("video_id", video_id).execute()
    sb.table("frame_analyses").insert(
        [
            {
                "video_id": video_id,
                "frame_index": f.frame_index,
                "timestamp_seconds": f.timestamp_seconds,
                "severity": f.severity.value,
                "description": f.description,
                "detected_hazards": f.detected_hazards,
                "confidence": f.confidence,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            for f in analyses
        ]
    ).execute()


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
            return AnalyzeResponse(
                video_id=req.video_id,
                frame_count=len(cached),
                frames=cached,
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

    return AnalyzeResponse(
        video_id=req.video_id,
        frame_count=len(analyses),
        frames=analyses,
    )
