import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status

from app.config import settings
from app.schemas import AnalyzeRequest, Report, ReportRequest
from app.services.report import aggregate_severity, summarize
from app.services.video import extract_frames
from app.services.vlm import analyze_frame

router = APIRouter(prefix="/report", tags=["report"])


@router.post("", response_model=Report)
def generate_report(req: ReportRequest) -> Report:
    matches = list(settings.upload_dir.glob(f"{req.video_id}.*"))
    if not matches:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"video_id {req.video_id} not found",
        )
    video_path = matches[0]

    interval = settings.frame_interval_seconds
    frame_paths = extract_frames(video_path, req.video_id, interval_seconds=interval)
    analyses = [
        analyze_frame(p, i, i * interval) for i, p in enumerate(frame_paths)
    ]

    summary, findings, recs = summarize(analyses)

    return Report(
        report_id=uuid.uuid4().hex,
        video_id=req.video_id,
        summary=summary,
        overall_severity=aggregate_severity(analyses),
        key_findings=findings,
        recommendations=recs,
        location=req.location,
        created_at=datetime.now(timezone.utc),
    )


# Re-export for type users that need AnalyzeRequest alongside ReportRequest
__all__ = ["router", "AnalyzeRequest"]
