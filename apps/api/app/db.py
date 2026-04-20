from functools import lru_cache

from supabase import Client, create_client  # type: ignore[attr-defined]

from app.config import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    if not settings.supabase_url.strip() or not settings.supabase_key.strip():
        raise RuntimeError(
            "Supabase credentials are not configured. "
            "In apps/api/.env set SUPABASE_URL and SUPABASE_KEY (Project Settings → API in the Supabase dashboard). "
            "Create a public or service-role key as needed; ensure the Storage bucket named in SUPABASE_BUCKET exists."
        )
    return create_client(settings.supabase_url, settings.supabase_key)
