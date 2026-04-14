from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    supabase_url: str = ""
    supabase_key: str = ""
    ollama_host: str = "http://localhost:11434"

    zai_api_key: str = ""
    zai_base_url: str = "https://api.z.ai/api/paas/v4"

    vlm_mode: Literal["real", "mock", "zai"] = "real"
    vlm_model: str = "gemma3:4b"
    upload_dir: Path = Path("./uploads")
    frames_dir: Path = Path("./frames")
    frame_interval_seconds: float = 2.0

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
