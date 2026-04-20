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

    supabase_url: str = Field(validation_alias=AliasChoices("SUPABASE_URL", "supabase_url"))
    supabase_key: str = Field(validation_alias=AliasChoices("SUPABASE_KEY", "supabase_key"))
    supabase_bucket: str = "videos"
    database_url: str = Field(
        validation_alias=AliasChoices("DATABASE_URL", "SUPABASE_CONNECTION_STRING"),
    )
    ollama_host: str = "http://localhost:11434"

    zai_api_key: str = Field(validation_alias=AliasChoices("ZAI_API_KEY", "zai_api_key"))
    zai_base_url: str = "https://api.z.ai/api/paas/v4"

    vlm_mode: Literal["real", "mock", "zai"] = "real"
    vlm_model: str = "glm-4.6v-flash"
    chat_model: str = "glm-4.5-flash"
    upload_dir: Path = Path("./uploads")
    frames_dir: Path = Path("./frames")
    frame_interval_seconds: float = 10.0
    ffmpeg_bin: str = "ffmpeg"
    ffprobe_bin: str = "ffprobe"

    cors_origins: list[str] = [
        "http://localhost:1420",
        "http://localhost:5173",
        "tauri://localhost",
        "https://tauri.localhost",
    ]

    def ensure_dirs(self) -> None:
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.frames_dir.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_dirs()
