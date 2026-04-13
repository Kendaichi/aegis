from pathlib import Path

import ffmpeg

from app.config import settings


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

    (
        ffmpeg
        .input(str(video_path))
        .output(pattern, vf=f"fps={fps}", **{"qscale:v": 2})
        .overwrite_output()
        .run(quiet=True)
    )

    return sorted(out_dir.glob("frame_*.jpg"))


def probe_duration_seconds(video_path: Path) -> float:
    meta = ffmpeg.probe(str(video_path))
    return float(meta["format"]["duration"])
