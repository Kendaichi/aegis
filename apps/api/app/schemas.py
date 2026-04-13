from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class DamageSeverity(str, Enum):
    none = "none"
    minor = "minor"
    moderate = "moderate"
    severe = "severe"
    destroyed = "destroyed"


class GeoPoint(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class UploadResponse(BaseModel):
    video_id: str
    filename: str
    size_bytes: int
    content_type: str | None = None
    created_at: datetime


class FrameAnalysis(BaseModel):
    frame_index: int
    timestamp_seconds: float
    severity: DamageSeverity
    description: str
    detected_hazards: list[str] = Field(default_factory=list)
    confidence: float = Field(..., ge=0.0, le=1.0)


class AnalyzeRequest(BaseModel):
    video_id: str
    frame_interval_seconds: float | None = None
    location: GeoPoint | None = None


class AnalyzeResponse(BaseModel):
    video_id: str
    frame_count: int
    frames: list[FrameAnalysis]


class ReportRequest(BaseModel):
    video_id: str
    location: GeoPoint | None = None
    incident_type: str | None = None


class Report(BaseModel):
    report_id: str
    video_id: str
    summary: str
    overall_severity: DamageSeverity
    key_findings: list[str]
    recommendations: list[str]
    location: GeoPoint | None = None
    created_at: datetime


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    report_id: str | None = None
    video_id: str | None = None
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    message: ChatMessage
