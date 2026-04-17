import tempfile
from pathlib import Path

from fastapi import HTTPException, status

from app.config import settings
from app.db import get_supabase


def upload_to_bucket(file_bytes: bytes, storage_path: str, content_type: str) -> None:
    sb = get_supabase()
    sb.storage.from_(settings.supabase_bucket).upload(
        storage_path,
        file_bytes,
        {"content-type": content_type, "upsert": "false"},
    )


def download_to_temp(storage_path: str, suffix: str) -> Path:
    sb = get_supabase()
    try:
        data: bytes = sb.storage.from_(settings.supabase_bucket).download(storage_path)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not retrieve video from storage: {exc}",
        ) from exc
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(data)
    tmp.close()
    return Path(tmp.name)


def get_signed_url(storage_path: str, expires_in: int = 3600) -> str:
    sb = get_supabase()
    result = sb.storage.from_(settings.supabase_bucket).create_signed_url(storage_path, expires_in)
    return result.get("signedURL") or result.get("signed_url") or ""
