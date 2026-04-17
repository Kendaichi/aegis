from fastapi import APIRouter, HTTPException, status

from app.config import settings
from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.video import extract_frames
from app.services.vlm import analyze_frame

router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.post("", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    """
    Analyze a uploaded video frame-by-frame.

    Extracts frames at the requested interval (or the server default), runs
    each frame through the vision model, and returns per-frame damage
    assessments including severity, detected hazards, and confidence scores.
    """
    matches = list(settings.upload_dir.glob(f"{req.video_id}.*"))
    if not matches:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"video_id {req.video_id} not found in uploads",
        )
    video_path = matches[0]

    interval = req.frame_interval_seconds or settings.frame_interval_seconds
    frame_paths = extract_frames(video_path, req.video_id, interval_seconds=interval)

    analyses = [
        analyze_frame(
            frame_path=p,
            frame_index=i,
            timestamp_seconds=i * interval,
        )
        for i, p in enumerate(frame_paths)
    ]

    return AnalyzeResponse(
        video_id=req.video_id,
        frame_count=len(analyses),
        frames=analyses,
    )
