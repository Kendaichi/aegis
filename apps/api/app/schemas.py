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
    lat: float = Field(..., ge=-90, le=90, description="Latitude in decimal degrees (-90 to 90)")
    lng: float = Field(
        ..., ge=-180, le=180, description="Longitude in decimal degrees (-180 to 180)"
    )


class UploadResponse(BaseModel):
    video_id: str = Field(..., description="Unique identifier for the uploaded video")
    filename: str = Field(..., description="Original filename of the uploaded video")
    size_bytes: int = Field(..., description="File size in bytes")
    content_type: str | None = Field(None, description="MIME type of the uploaded file")
    created_at: datetime = Field(..., description="UTC timestamp of when the file was uploaded")


class VideoListItem(BaseModel):
    video_id: str = Field(..., description="Unique identifier for the uploaded video")
    filename: str = Field(..., description="Filename as stored on disk")
    size_bytes: int = Field(..., description="File size in bytes")
    created_at: datetime = Field(..., description="UTC timestamp of when the file was uploaded")


class VideoListResponse(BaseModel):
    videos: list[VideoListItem] = Field(..., description="List of uploaded videos")
    total: int = Field(..., description="Total number of uploaded videos")


class FrameAnalysis(BaseModel):
    frame_index: int = Field(..., description="Zero-based index of the frame within the video")
    timestamp_seconds: float = Field(
        ..., description="Time offset of the frame from the start of the video"
    )
    severity: DamageSeverity = Field(
        ..., description="Assessed damage severity level for this frame"
    )
    description: str = Field(
        ..., description="Natural language description of observed damage or conditions"
    )
    detected_hazards: list[str] = Field(
        default_factory=list, description="List of specific hazards detected in the frame"
    )
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Model confidence score for this assessment (0.0–1.0)"
    )


class AnalyzeRequest(BaseModel):
    video_id: str = Field(..., description="ID of a previously uploaded video (from /upload)")
    frame_interval_seconds: float | None = Field(
        None, description="Seconds between sampled frames; uses server default if omitted"
    )
    location: GeoPoint | None = Field(
        None, description="Optional GPS coordinates of the incident site"
    )


class AnalyzeResponse(BaseModel):
    video_id: str = Field(..., description="ID of the analyzed video")
    frame_count: int = Field(..., description="Number of frames that were analyzed")
    frames: list[FrameAnalysis] = Field(..., description="Per-frame analysis results")


class ReportRequest(BaseModel):
    video_id: str = Field(..., description="ID of a previously uploaded video (from /upload)")
    location: GeoPoint | None = Field(
        None, description="Optional GPS coordinates of the incident site"
    )
    incident_type: str | None = Field(
        None,
        description="Optional classification of the incident (e.g. 'flood', 'fire', 'earthquake')",
    )


class Report(BaseModel):
    report_id: str = Field(..., description="Unique identifier for this generated report")
    video_id: str = Field(..., description="ID of the source video")
    summary: str = Field(..., description="High-level narrative summary of the assessment")
    overall_severity: DamageSeverity = Field(
        ..., description="Worst-case severity level across all analyzed frames"
    )
    key_findings: list[str] = Field(
        ..., description="Bullet-point list of the most critical observations"
    )
    recommendations: list[str] = Field(..., description="Actionable recommendations for responders")
    location: GeoPoint | None = Field(
        None, description="GPS coordinates of the incident site, if provided"
    )
    created_at: datetime = Field(..., description="UTC timestamp of when the report was generated")


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"] = Field(
        ..., description="Speaker role for this message"
    )
    content: str = Field(..., description="Text content of the message")


class ChatRequest(BaseModel):
    report_id: str | None = Field(
        None, description="Optional report ID to give the assistant context about a specific report"
    )
    video_id: str | None = Field(
        None, description="Optional video ID to give the assistant context about a specific video"
    )
    messages: list[ChatMessage] = Field(
        ..., description="Conversation history; include all prior turns for multi-turn chat"
    )


class ChatResponse(BaseModel):
    message: ChatMessage = Field(..., description="The assistant's reply")
