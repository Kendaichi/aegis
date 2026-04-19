import base64
import hashlib
import json
import mimetypes
import time
from pathlib import Path

from fastapi import HTTPException, status
from ollama import Client
from openai import OpenAI, RateLimitError

from app.config import settings
from app.schemas import DamageSeverity, Detection, FrameAnalysis

_client: Client | None = None
_zai_client_instance: OpenAI | None = None

CHAT_SYSTEM_PROMPT = (
    "You are AEGIS, an AI analyst for Disaster Risk Reduction and Management (DRRM). "
    "You assist emergency responders, analysts, and coordinators by interpreting aerial footage, "
    "damage reports, and frame analysis data. "
    "You ONLY answer questions related to DRRM topics such as: disaster damage assessment, "
    "hazard identification, evacuation planning, rescue prioritization, infrastructure impact, "
    "flood/landslide/typhoon/earthquake/fire analysis, and emergency response recommendations. "
    "If a question is not related to DRRM or disaster response, politely decline and remind the "
    "user that you are scoped to disaster risk reduction and management queries only."
)

FRAME_PROMPT = """You are a disaster-response analyst reviewing a single frame of site footage.
Locate visible disaster damage: draw conceptual bounding boxes around each distinct damaged region
(buildings, road sections, debris piles, flood water, etc.). Coordinates are NORMALIZED to the
image: origin top-left, x and y from 0.0 to 1.0.

Respond with STRICT JSON matching this schema:
{
  "severity": "none|minor|moderate|severe|destroyed",
  "description": "one to two sentence description of visible damage",
  "detected_hazards": ["list", "of", "hazards"],
  "confidence": 0.85,
  "detections": [
    {
      "label": "short region label e.g. collapsed roof",
      "severity": "none|minor|moderate|severe|destroyed",
      "bbox": [x1, y1, x2, y2],
      "confidence": 0.72
    }
  ]
}
Rules:
- confidence fields: your actual certainty estimate as a float from 0.0 (uncertain) to 1.0 (certain). Do NOT copy the example values — replace them with your real estimate.
- bbox: x1 < x2, y1 < y2, all values in [0, 1]. Use 1–5 boxes when damage is visible; use an empty array if none.
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


def _get_zai_client() -> OpenAI:
    global _zai_client_instance
    if _zai_client_instance is None:
        if not settings.zai_api_key:
            raise RuntimeError("ZAI_API_KEY is not set; cannot use VLM_MODE=zai.")
        _zai_client_instance = OpenAI(
            api_key=settings.zai_api_key,
            base_url=settings.zai_base_url,
        )
    return _zai_client_instance


def _frame_data_url(frame_path: Path) -> str:
    mime = mimetypes.guess_type(frame_path.name)[0] or "image/jpeg"
    b64 = base64.b64encode(frame_path.read_bytes()).decode()
    return f"data:{mime};base64,{b64}"


def _clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def _parse_detections(raw: object) -> list[Detection]:
    if not isinstance(raw, list):
        return []
    out: list[Detection] = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        bbox_raw = item.get("bbox")
        if not isinstance(bbox_raw, (list, tuple)) or len(bbox_raw) != 4:
            continue
        try:
            x1 = _clamp01(float(bbox_raw[0]))
            y1 = _clamp01(float(bbox_raw[1]))
            x2 = _clamp01(float(bbox_raw[2]))
            y2 = _clamp01(float(bbox_raw[3]))
            if x2 <= x1 or y2 <= y1:
                continue
            sev = DamageSeverity(str(item.get("severity", "none")))
            conf = float(item.get("confidence", 0.5))
            conf = max(0.0, min(1.0, conf))
            raw_label = str(item.get("label", "damage")).strip() or "damage"
            label = raw_label[:240]
            out.append(
                Detection(
                    label=label,
                    severity=sev,
                    bbox=(x1, y1, x2, y2),
                    confidence=conf,
                )
            )
        except (ValueError, TypeError):
            continue
    return out


def _parse_frame_json(
    raw: str,
    frame_index: int,
    timestamp_seconds: float,
) -> FrameAnalysis:
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        data = {
            "severity": "none",
            "description": raw[:400] or "Model returned non-JSON output.",
            "detected_hazards": [],
            "confidence": 0.0,
            "detections": [],
        }
    detections = _parse_detections(data.get("detections", []))
    return FrameAnalysis(
        frame_index=frame_index,
        timestamp_seconds=timestamp_seconds,
        severity=DamageSeverity(data.get("severity", "none")),
        description=str(data.get("description", "")),
        detected_hazards=list(data.get("detected_hazards", []) or []),
        confidence=float(data.get("confidence", 0.0)),
        detections=detections,
    )


def _mock_frame_analysis(
    frame_path: Path,
    frame_index: int,
    timestamp_seconds: float,
) -> FrameAnalysis:
    seed = int(hashlib.md5(frame_path.name.encode()).hexdigest(), 16) + frame_index
    bucket = seed % len(_MOCK_SEVERITIES)
    sev = _MOCK_SEVERITIES[bucket]
    # Two overlapping-style boxes with slight jitter so overlays are visible in the UI.
    jitter = (seed % 7) * 0.01
    mock_detections = [
        Detection(
            label="Primary damage / hazard region",
            severity=sev,
            bbox=(
                _clamp01(0.18 + jitter),
                _clamp01(0.22 + jitter),
                _clamp01(0.62 + jitter),
                _clamp01(0.78 + jitter),
            ),
            confidence=min(0.95, 0.55 + bucket * 0.08),
        ),
        Detection(
            label="Secondary risk zone",
            severity=_MOCK_SEVERITIES[max(0, bucket - 1)],
            bbox=(
                _clamp01(0.55 - jitter),
                _clamp01(0.12),
                _clamp01(0.92),
                _clamp01(0.45 + jitter),
            ),
            confidence=0.62,
        ),
    ]
    return FrameAnalysis(
        frame_index=frame_index,
        timestamp_seconds=timestamp_seconds,
        severity=sev,
        description=_MOCK_DESCRIPTIONS[bucket],
        detected_hazards=list(_MOCK_HAZARDS[bucket]),
        confidence=0.5 + (bucket * 0.1),
        detections=mock_detections,
    )


def analyze_frame(
    frame_path: Path,
    frame_index: int,
    timestamp_seconds: float,
) -> FrameAnalysis:
    if settings.vlm_mode == "mock":
        return _mock_frame_analysis(frame_path, frame_index, timestamp_seconds)

    if settings.vlm_mode == "zai":
        last_exc: RateLimitError | None = None
        for attempt in range(4):
            if attempt:
                time.sleep(2**attempt)
            try:
                response = _get_zai_client().chat.completions.create(
                    model=settings.vlm_model,
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": FRAME_PROMPT},
                                {
                                    "type": "image_url",
                                    "image_url": {"url": _frame_data_url(frame_path)},
                                },
                            ],
                        }
                    ],
                    response_format={"type": "json_object"},
                )
                raw = (response.choices[0].message.content or "").strip()
                return _parse_frame_json(raw, frame_index, timestamp_seconds)
            except RateLimitError as exc:
                last_exc = exc
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"VLM service rate-limited after retries: {last_exc}",
        )

    client = _get_client()
    ollama_response = client.generate(
        model=settings.vlm_model,
        prompt=FRAME_PROMPT,
        images=[str(frame_path)],
        format="json",
        stream=False,
    )
    raw = (ollama_response.response or "").strip()
    return _parse_frame_json(raw, frame_index, timestamp_seconds)


def chat_completion(messages: list[dict[str, str]]) -> str:
    system_message = {"role": "system", "content": CHAT_SYSTEM_PROMPT}
    # Prepend system prompt, replacing any existing system message at position 0.
    if messages and messages[0].get("role") == "system":
        scoped_messages = [system_message, *messages[1:]]
    else:
        scoped_messages = [system_message, *messages]

    if settings.vlm_mode == "mock":
        last_user = next(
            (m["content"] for m in reversed(scoped_messages) if m.get("role") == "user"),
            "",
        )
        preview = last_user.strip().splitlines()[0][:120] if last_user else "your question"
        return (
            "[mock VLM] I'd normally analyse the report to answer: "
            f"'{preview}'. Set VLM_MODE=real to use Gemma via Ollama."
        )

    if settings.vlm_mode == "zai":
        zai_response = _get_zai_client().chat.completions.create(
            model=settings.vlm_model,
            messages=scoped_messages,  # type: ignore[arg-type]
        )
        return zai_response.choices[0].message.content or ""

    client = _get_client()
    ollama_response = client.chat(
        model=settings.vlm_model,
        messages=scoped_messages,
        stream=False,
    )
    return ollama_response.message.content or ""
