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


def _get_client() -> Client:
    global _client
    if _client is None:
        _client = Client(host=settings.ollama_host)
    return _client


def analyze_frame(
    frame_path: Path,
    frame_index: int,
    timestamp_seconds: float,
) -> FrameAnalysis:
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
    client = _get_client()
    response = client.chat(
        model=settings.vlm_model,
        messages=messages,
        stream=False,
    )
    return response["message"]["content"]
