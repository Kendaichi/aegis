from collections import Counter

from app.schemas import DamageSeverity, FrameAnalysis

_SEVERITY_ORDER = [
    DamageSeverity.none,
    DamageSeverity.minor,
    DamageSeverity.moderate,
    DamageSeverity.severe,
    DamageSeverity.destroyed,
]


def aggregate_severity(frames: list[FrameAnalysis]) -> DamageSeverity:
    if not frames:
        return DamageSeverity.none
    max_idx = max(_SEVERITY_ORDER.index(f.severity) for f in frames)
    return _SEVERITY_ORDER[max_idx]


def summarize(frames: list[FrameAnalysis]) -> tuple[str, list[str], list[str]]:
    if not frames:
        return "No frames were analyzed.", [], []

    severity = aggregate_severity(frames)
    hazard_counts = Counter(h for f in frames for h in f.detected_hazards)
    top_hazards = [h for h, _ in hazard_counts.most_common(5)]

    summary = (
        f"Analyzed {len(frames)} frames. Overall damage level: {severity.value}. "
        f"Most frequent hazards: {', '.join(top_hazards) if top_hazards else 'none detected'}."
    )

    key_findings = [
        f"Frame @ {f.timestamp_seconds:.1f}s — {f.severity.value}: {f.description}"
        for f in sorted(frames, key=lambda x: _SEVERITY_ORDER.index(x.severity), reverse=True)[:5]
    ]

    recommendations = _recommend(severity, top_hazards)
    return summary, key_findings, recommendations


def _recommend(severity: DamageSeverity, hazards: list[str]) -> list[str]:
    recs: list[str] = []
    if severity in (DamageSeverity.severe, DamageSeverity.destroyed):
        recs.append("Dispatch urban search-and-rescue teams to the site.")
        recs.append("Establish a safety perimeter; restrict civilian access.")
    if severity == DamageSeverity.moderate:
        recs.append("Deploy structural engineers for load-bearing assessment.")
    if any("fire" in h.lower() for h in hazards):
        recs.append("Coordinate with fire services; monitor for flare-ups.")
    if any("flood" in h.lower() or "water" in h.lower() for h in hazards):
        recs.append("Address water ingress; check for electrical and contamination hazards.")
    if not recs:
        recs.append("Continue routine monitoring; no immediate action required.")
    return recs
