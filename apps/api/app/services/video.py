import os
import shutil
from pathlib import Path

import ffmpeg

from app.config import settings


def _resolve_binary(configured: str, env_var: str, windows_package_exe: str) -> str:
    """Resolve an ffmpeg-family executable across local dev and container setups."""
    configured_value = os.getenv(env_var, configured)
    if shutil.which(configured_value):
        return configured_value

    windows_candidate = (
        Path(os.environ.get("LOCALAPPDATA", ""))
        / "Microsoft"
        / "WinGet"
        / "Packages"
        / "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe"
        / "ffmpeg-8.1-full_build"
        / "bin"
        / windows_package_exe
    )
    if windows_candidate.is_file():
        return str(windows_candidate)

    return configured_value


def _run_ffmpeg(stream: ffmpeg.nodes.OutputStream) -> None:
    ffmpeg_bin = _resolve_binary(settings.ffmpeg_bin, "FFMPEG_BIN", "ffmpeg.exe")
    try:
        stream.overwrite_output().run(cmd=ffmpeg_bin, quiet=True)
    except FileNotFoundError as exc:
        raise RuntimeError(
            "FFmpeg executable not found. Set FFMPEG_BIN in apps/api/.env "
            "or install FFmpeg so the API process can resolve it."
        ) from exc


def _probe(video_path: Path) -> dict:
    ffprobe_bin = _resolve_binary(settings.ffprobe_bin, "FFPROBE_BIN", "ffprobe.exe")
    try:
        return ffmpeg.probe(str(video_path), cmd=ffprobe_bin)
    except FileNotFoundError as exc:
        raise RuntimeError(
            "FFprobe executable not found. Set FFPROBE_BIN in apps/api/.env "
            "or install FFmpeg/FFprobe so the API process can resolve it."
        ) from exc


def extract_frames(
    video_path: Path,
    video_id: str,
    interval_seconds: float | None = None,
) -> list[Path]:
    """Extract one frame every `interval_seconds` from the video.

    Returns the ordered list of produced frame paths.
    """
    interval = interval_seconds or settings.frame_interval_seconds
    out_dir = settings.frames_dir / video_id
    out_dir.mkdir(parents=True, exist_ok=True)

    pattern = str(out_dir / "frame_%05d.jpg")
    fps = 1.0 / max(interval, 0.1)

    _run_ffmpeg(ffmpeg.input(str(video_path)).output(pattern, vf=f"fps={fps}", **{"qscale:v": 2}))

    return sorted(out_dir.glob("frame_*.jpg"))


def probe_duration_seconds(video_path: Path) -> float:
    meta = _probe(video_path)
    return float(meta["format"]["duration"])
