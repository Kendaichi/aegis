from pathlib import Path
from typing import Literal

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Always load apps/api/.env regardless of cwd (e.g. uvicorn run from repo root).
_API_ROOT = Path(__file__).resolve().parent.parent
_API_ENV = _API_ROOT / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_API_ENV,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    supabase_url: str = "https://ovgimeasyrwnjlmrqssu.supabase.co"
    supabase_key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92Z2ltZWFzeXJ3bmpsbXJxc3N1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI3MDk1OSwiZXhwIjoyMDkxODQ2OTU5fQ.vXSL-_oVop8io74FSowMJoeBhyYNY3Upc8mbjLrlUAc"
    supabase_bucket: str = "videos"
    database_url: str = Field(
        default="postgresql://postgres:ELuXVCJDvjtdfskk@db.ovgimeasyrwnjlmrqssu.supabase.co:5432/postgres",
        validation_alias=AliasChoices("DATABASE_URL", "SUPABASE_CONNECTION_STRING"),
    )
    ollama_host: str = "http://localhost:11434"

    zai_api_key: str = ""
    zai_base_url: str = "https://api.z.ai/api/paas/v4"

    vlm_mode: Literal["real", "mock", "zai"] = "mock"
    vlm_model: str = "glm-4.6v-flash"
    upload_dir: Path = Path("./uploads")
    frames_dir: Path = Path("./frames")
    frame_interval_seconds: float = 2.0
    ffmpeg_bin: str = "ffmpeg"
    ffprobe_bin: str = "ffprobe"

    cors_origins: list[str] = [
        "http://localhost:1420",
        "http://localhost:5173",
        "tauri://localhost",
    ]

    def ensure_dirs(self) -> None:
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.frames_dir.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_dirs()
