import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.db import get_supabase
from app.schemas import UploadResponse, VideoListItem, VideoListResponse
from app.services.storage import get_signed_url, upload_to_bucket

router = APIRouter(prefix="/upload", tags=["upload"])

_ALLOWED_PREFIXES = ("video/",)


@router.post("", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_video(
    file: UploadFile = File(...),
    title: str | None = Form(None),
    location_name: str | None = Form(None),
    incident_type: str | None = Form(None),
    lat: float | None = Form(None),
    lng: float | None = Form(None),
) -> UploadResponse:
    """
    Upload a disaster footage video.

    Accepts any `video/*` content type. Optional `title`, `location_name`,
    `incident_type`, `lat`, and `lng` are stored as assessment metadata.
    The returned `video_id` is required by the `/analyze`, `/report`, and
    `/chat` endpoints.
    """
    if file.content_type and not file.content_type.startswith(_ALLOWED_PREFIXES):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Expected video/*, got {file.content_type}",
        )

    video_id = uuid.uuid4().hex
    suffix = ""
    if file.filename and "." in file.filename:
        suffix = "." + file.filename.rsplit(".", 1)[-1]

    storage_path = f"videos/{video_id}{suffix}"
    file_bytes = await file.read()
    size = len(file_bytes)
    content_type = file.content_type or "video/mp4"
    now = datetime.now(timezone.utc)
    resolved_filename = file.filename or f"{video_id}{suffix}"
    resolved_title = title or resolved_filename

    try:
        upload_to_bucket(file_bytes, storage_path, content_type)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to upload to storage: {exc}",
        ) from exc

    sb = get_supabase()
    sb.table("videos").insert(
        {
            "video_id": video_id,
            "filename": resolved_filename,
            "size_bytes": size,
            "content_type": content_type,
            "storage_path": storage_path,
            "title": resolved_title,
            "location_name": location_name,
            "incident_type": incident_type,
            "lat": lat,
            "lng": lng,
            "status": "pending",
            "created_at": now.isoformat(),
        }
    ).execute()

    return UploadResponse(
        video_id=video_id,
        filename=resolved_filename,
        size_bytes=size,
        content_type=content_type,
        title=resolved_title,
        location_name=location_name,
        incident_type=incident_type,
        lat=lat,
        lng=lng,
        status="pending",
        created_at=now,
    )


@router.get("", response_model=VideoListResponse)
def list_videos() -> VideoListResponse:
    """
    List all uploaded videos.

    Returns every video record from the database with a fresh signed URL
    for temporary playback access (valid 1 hour).
    """
    sb = get_supabase()
    result = sb.table("videos").select("*").order("created_at", desc=True).execute()

    videos: list[VideoListItem] = []
    for row in result.data or []:
        signed_url = get_signed_url(row["storage_path"])
        videos.append(
            VideoListItem(
                video_id=row["video_id"],
                filename=row["filename"],
                size_bytes=row["size_bytes"],
                content_type=row.get("content_type"),
                title=row.get("title"),
                location_name=row.get("location_name"),
                incident_type=row.get("incident_type"),
                lat=row.get("lat"),
                lng=row.get("lng"),
                status=row.get("status") or "pending",
                created_at=datetime.fromisoformat(row["created_at"]),
                url=signed_url or None,
            )
        )

    return VideoListResponse(videos=videos, total=len(videos))
