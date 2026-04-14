import hashlib
import json
from pathlib import Path

from ollama import Client

from app.config import settings
from app.schemas import DamageSeverity, FrameAnalysis

_client: Client | None = None

FRAME_PROMPT = """You are a disaster-response analyst reviewing a single frame of site footage.
Respond with STRICT JSON matching this schema:
{
  "severity": "none|minor|moderate|severe|destroyed",
  "description": "one to two sentence description of visible damage",
  "detected_hazards": ["list", "of", "hazards"],
  "confidence": 0.0
}
Only output the JSON object. No prose, no markdown fences."""

_MOCK_SEVERITIES: list[DamageSeverity] = [
    DamageSeverity.none,
    DamageSeverity.minor,
    DamageSeverity.moderate,
    DamageSeverity.severe,
    DamageSeverity.destroyed,
]

_MOCK_DESCRIPTIONS = [
    "No visible structural damage; minor surface debris on roadway.",
    "Cracked exterior wall and scattered roof tiles near the entrance.",
    "Partially collapsed second floor with leaning support beams.",
    "Severe structural failure; load-bearing wall sheared off.",
    "Building fully collapsed into rubble; no recognisable facade.",
]

_MOCK_HAZARDS = [
    [],
    ["loose debris"],
    ["exposed rebar", "unstable masonry"],
    ["structural collapse", "gas leak risk"],
    ["total collapse", "buried voids", "fire risk"],
]


def _get_client() -> Client:
    global _client
    if _client is None:
        _client = Client(host=settings.ollama_host)
    return _client


def _mock_frame_analysis(
    frame_path: Path,
    frame_index: int,
    timestamp_seconds: float,
) -> FrameAnalysis:
    seed = int(hashlib.md5(frame_path.name.encode()).hexdigest(), 16) + frame_index
    bucket = seed % len(_MOCK_SEVERITIES)
    return FrameAnalysis(
        frame_index=frame_index,
        timestamp_seconds=timestamp_seconds,
        severity=_MOCK_SEVERITIES[bucket],
        description=_MOCK_DESCRIPTIONS[bucket],
        detected_hazards=list(_MOCK_HAZARDS[bucket]),
        confidence=0.5 + (bucket * 0.1),
    )


def analyze_frame(
    frame_path: Path,
    frame_index: int,
    timestamp_seconds: float,
) -> FrameAnalysis:
    if settings.vlm_mode == "mock":
        return _mock_frame_analysis(frame_path, frame_index, timestamp_seconds)

    client = _get_client()
    response = client.generate(
        model=settings.vlm_model,
        prompt=FRAME_PROMPT,
        images=[str(frame_path)],
        format="json",
        stream=False,
    )
    raw = response.get("response", "").strip()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        data = {
            "severity": "none",
            "description": raw[:400] or "Model returned non-JSON output.",
            "detected_hazards": [],
            "confidence": 0.0,
        }

    return FrameAnalysis(
        frame_index=frame_index,
        timestamp_seconds=timestamp_seconds,
        severity=DamageSeverity(data.get("severity", "none")),
        description=str(data.get("description", "")),
        detected_hazards=list(data.get("detected_hazards", []) or []),
        confidence=float(data.get("confidence", 0.0)),
    )


def chat_completion(messages: list[dict[str, str]]) -> str:
    if settings.vlm_mode == "mock":
        last_user = next(
            (m["content"] for m in reversed(messages) if m.get("role") == "user"),
            "",
        )
        preview = last_user.strip().splitlines()[0][:120] if last_user else "your question"
        return (
            "[mock VLM] I'd normally analyse the report to answer: "
            f"'{preview}'. Set VLM_MODE=real to use Gemma via Ollama."
        )

    client = _get_client()
    response = client.chat(
        model=settings.vlm_model,
        messages=messages,
        stream=False,
    )
    return response["message"]["content"]
