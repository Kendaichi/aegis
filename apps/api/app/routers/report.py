import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.config import settings
from app.db import get_supabase
from app.routers.analyze import _load_cached_frames, _persist_frames
from app.schemas import AnalyzeRequest, GeoPoint, Report, ReportRequest
from app.services.report import aggregate_severity, summarize
from app.services.storage import download_to_temp
from app.services.video import extract_frames
from app.services.vlm import analyze_frame

router = APIRouter(prefix="/report", tags=["report"])


def _geo_from_lat_lng_row(row: dict[str, Any]) -> GeoPoint | None:
    """Build GeoPoint when both coordinates are present (allows 0.0)."""
    lat = row.get("lat")
    lng = row.get("lng")
    if lat is None or lng is None:
        return None
    return GeoPoint(lat=float(lat), lng=float(lng))


def _video_locations_by_id(sb: Any, video_ids: list[str]) -> dict[str, GeoPoint]:
    """Batch-fetch lat/lng for videos; skips ids with missing coords."""
    if not video_ids:
        return {}
    result = sb.table("videos").select("video_id, lat, lng").in_("video_id", video_ids).execute()
    out: dict[str, GeoPoint] = {}
    for row in result.data or []:
        pt = _geo_from_lat_lng_row(row)
        if pt is not None:
            out[str(row["video_id"])] = pt
    return out


def _report_location_or_video_fallback(
    sb: Any, row: dict[str, Any], video_locations: dict[str, GeoPoint] | None = None
) -> GeoPoint | None:
    """Use report lat/lng, or fall back to the parent video row."""
    direct = _geo_from_lat_lng_row(row)
    if direct is not None:
        return direct
    vid = str(row["video_id"])
    if video_locations is not None:
        return video_locations.get(vid)
    vr = sb.table("videos").select("lat, lng").eq("video_id", vid).maybe_single().execute()
    if not vr.data:
        return None
    return _geo_from_lat_lng_row(vr.data)


@router.post("", response_model=Report, status_code=status.HTTP_201_CREATED)
def generate_report(req: ReportRequest) -> Report:
    """
    Generate and persist a disaster assessment report from a video.

    Reuses cached frame analyses when available; otherwise downloads the video,
    runs frame extraction and VLM analysis, and caches the results.
    """
    sb = get_supabase()
    video_row = (
        sb.table("videos")
        .select("storage_path, filename, lat, lng")
        .eq("video_id", req.video_id)
        .maybe_single()
        .execute()
    )
    if not video_row.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"video_id {req.video_id} not found",
        )

    analyses = _load_cached_frames(req.video_id)
    if not analyses:
        storage_path: str = video_row.data["storage_path"]
        filename: str = video_row.data["filename"]
        suffix = ("." + filename.rsplit(".", 1)[-1]) if "." in filename else ""

        video_path = download_to_temp(storage_path, suffix)
        try:
            interval = settings.frame_interval_seconds
            frame_paths = extract_frames(video_path, req.video_id, interval_seconds=interval)
            analyses = [analyze_frame(p, i, i * interval) for i, p in enumerate(frame_paths)]
        finally:
            video_path.unlink(missing_ok=True)

        _persist_frames(req.video_id, analyses)

    summary, findings, recs = summarize(analyses)
    report_id = uuid.uuid4().hex
    now = datetime.now(timezone.utc)

    resolved_location = req.location or _geo_from_lat_lng_row(video_row.data)

    sb.table("reports").insert(
        {
            "report_id": report_id,
            "video_id": req.video_id,
            "summary": summary,
            "overall_severity": aggregate_severity(analyses).value,
            "key_findings": findings,
            "recommendations": recs,
            "incident_type": req.incident_type,
            "lat": resolved_location.lat if resolved_location else None,
            "lng": resolved_location.lng if resolved_location else None,
            "created_at": now.isoformat(),
        }
    ).execute()

    return Report(
        report_id=report_id,
        video_id=req.video_id,
        summary=summary,
        overall_severity=aggregate_severity(analyses),
        key_findings=findings,
        recommendations=recs,
        location=resolved_location,
        created_at=now,
    )


@router.get("/{report_id}", response_model=Report)
def get_report(report_id: str) -> Report:
    """Fetch a previously generated report by its ID."""
    sb = get_supabase()
    result = sb.table("reports").select("*").eq("report_id", report_id).maybe_single().execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"report_id {report_id} not found",
        )
    row = result.data
    location = _report_location_or_video_fallback(sb, row)
    return Report(
        report_id=row["report_id"],
        video_id=row["video_id"],
        summary=row["summary"],
        overall_severity=row["overall_severity"],
        key_findings=row["key_findings"] or [],
        recommendations=row["recommendations"] or [],
        location=location,
        created_at=datetime.fromisoformat(row["created_at"]),
    )


@router.get("", response_model=list[Report])
def list_reports(video_id: str | None = None) -> list[Report]:
    """List all reports, optionally filtered by video_id."""
    sb = get_supabase()
    query = sb.table("reports").select("*").order("created_at", desc=True)
    if video_id:
        query = query.eq("video_id", video_id)
    result = query.execute()

    rows = result.data or []
    need_fallback = [
        str(r["video_id"])
        for r in rows
        if _geo_from_lat_lng_row(r) is None
    ]
    video_locations = _video_locations_by_id(sb, list(dict.fromkeys(need_fallback)))

    reports = []
    for row in rows:
        location = _report_location_or_video_fallback(sb, row, video_locations)
        reports.append(
            Report(
                report_id=row["report_id"],
                video_id=row["video_id"],
                summary=row["summary"],
                overall_severity=row["overall_severity"],
                key_findings=row["key_findings"] or [],
                recommendations=row["recommendations"] or [],
                location=location,
                created_at=datetime.fromisoformat(row["created_at"]),
            )
        )
    return reports


__all__ = ["router", "AnalyzeRequest"]
