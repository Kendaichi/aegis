import mimetypes
import shutil
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.config import settings
from app.schemas import UploadResponse, VideoListItem, VideoListResponse

router = APIRouter(prefix="/upload", tags=["upload"])

_ALLOWED_PREFIXES = ("video/",)


@router.post("", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_video(file: UploadFile = File(...)) -> UploadResponse:
    """
    Upload a disaster footage video.

    Accepts any `video/*` content type. The returned `video_id` is required
    by the `/analyze`, `/report`, and `/chat` endpoints.
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
    dest = settings.upload_dir / f"{video_id}{suffix}"

    with dest.open("wb") as out:
        shutil.copyfileobj(file.file, out)

    size = dest.stat().st_size

    return UploadResponse(
        video_id=video_id,
        filename=file.filename or dest.name,
        size_bytes=size,
        content_type=file.content_type,
        created_at=datetime.now(timezone.utc),
    )


@router.get("", response_model=VideoListResponse)
def list_videos() -> VideoListResponse:
    """
    List all uploaded videos.

    Returns every file in the upload directory with its video_id, filename,
    size, and upload timestamp derived from the file's modification time.
    """
    videos: list[VideoListItem] = []
    for path in sorted(settings.upload_dir.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True):
        if not path.is_file():
            continue
        mime, _ = mimetypes.guess_type(path.name)
        if not mime or not mime.startswith("video/"):
            continue
        stat = path.stat()
        video_id = path.stem
        videos.append(
            VideoListItem(
                video_id=video_id,
                filename=path.name,
                size_bytes=stat.st_size,
                created_at=datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc),
            )
        )
    return VideoListResponse(videos=videos, total=len(videos))
