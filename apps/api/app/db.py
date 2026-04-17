from functools import lru_cache

from supabase import Client, create_client  # type: ignore[attr-defined]

from app.config import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    if not settings.supabase_url or not settings.supabase_key:
        raise RuntimeError(
            "Supabase credentials are not configured. Set SUPABASE_URL and SUPABASE_KEY in .env."
        )
    return create_client(settings.supabase_url, settings.supabase_key)
