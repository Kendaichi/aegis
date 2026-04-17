from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status

from app.db import get_supabase
from app.schemas import ChatMessage, ChatRequest, ChatResponse
from app.services.vlm import chat_completion

router = APIRouter(prefix="/chat", tags=["chat"])

SYSTEM_PROMPT = (
    "You are AEGIS, an AI assistant embedded in a disaster-assessment tool. "
    "Answer questions about damage reports and video findings concisely, "
    "prioritizing responder safety and actionable next steps."
)


def _load_session_history(session_id: str) -> list[dict[str, str]]:
    sb = get_supabase()
    result = (
        sb.table("chat_messages")
        .select("role, content")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    return [{"role": r["role"], "content": r["content"]} for r in (result.data or [])]


def _create_session(video_id: str | None, report_id: str | None) -> str:
    sb = get_supabase()
    now = datetime.now(timezone.utc).isoformat()
    result = (
        sb.table("chat_sessions")
        .insert(
            {
                "video_id": video_id,
                "report_id": report_id,
                "created_at": now,
                "updated_at": now,
            }
        )
        .execute()
    )
    return result.data[0]["session_id"]


def _persist_messages(session_id: str, messages: list[dict[str, str]]) -> None:
    sb = get_supabase()
    now = datetime.now(timezone.utc).isoformat()
    sb.table("chat_messages").insert(
        [
            {
                "session_id": session_id,
                "role": m["role"],
                "content": m["content"],
                "created_at": now,
            }
            for m in messages
        ]
    ).execute()
    sb.table("chat_sessions").update({"updated_at": now}).eq(
        "session_id", session_id
    ).execute()


def _build_context_messages(report_id: str | None, video_id: str | None) -> list[dict[str, str]]:
    """Inject persisted report/analysis context into the system prompt."""
    context: list[dict[str, str]] = []
    if not report_id and not video_id:
        return context

    sb = get_supabase()

    if report_id:
        result = (
            sb.table("reports")
            .select("summary, overall_severity, key_findings, recommendations, incident_type")
            .eq("report_id", report_id)
            .maybe_single()
            .execute()
        )
        if result.data:
            row = result.data
            findings = "\n".join(f"- {f}" for f in (row["key_findings"] or []))
            recs = "\n".join(f"- {r}" for r in (row["recommendations"] or []))
            context.append(
                {
                    "role": "system",
                    "content": (
                        f"Report context (ID: {report_id}):\n"
                        f"Incident type: {row.get('incident_type') or 'unspecified'}\n"
                        f"Overall severity: {row['overall_severity']}\n"
                        f"Summary: {row['summary']}\n"
                        f"Key findings:\n{findings}\n"
                        f"Recommendations:\n{recs}"
                    ),
                }
            )

    if video_id:
        frames = (
            sb.table("frame_analyses")
            .select("frame_index, timestamp_seconds, severity, description, detected_hazards")
            .eq("video_id", video_id)
            .order("frame_index")
            .execute()
        )
        if frames.data:
            frame_lines = "\n".join(
                f"  Frame {r['frame_index']} @ {r['timestamp_seconds']:.1f}s — "
                f"{r['severity']}: {r['description']} "
                f"(hazards: {', '.join(r['detected_hazards'] or []) or 'none'})"
                for r in frames.data
            )
            context.append(
                {
                    "role": "system",
                    "content": f"Frame-level analysis for video {video_id}:\n{frame_lines}",
                }
            )

    return context


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    """
    Chat with the AEGIS disaster-assessment assistant.

    Pass `session_id` to continue a prior conversation — history is loaded
    from the database automatically. Omit it to start a new session.
    Optionally supply `report_id` or `video_id` to ground the assistant in
    the relevant analysis context.
    """
    # Resolve or create session
    session_id = req.session_id
    if session_id:
        sb = get_supabase()
        exists = (
            sb.table("chat_sessions")
            .select("session_id")
            .eq("session_id", session_id)
            .maybe_single()
            .execute()
        )
        if not exists.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"session_id {session_id} not found",
            )
    else:
        session_id = _create_session(req.video_id, req.report_id)

    # Build message list: system prompt + context + history + new messages
    messages: list[dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(_build_context_messages(req.report_id, req.video_id))
    messages.extend(_load_session_history(session_id))
    new_user_messages = [{"role": m.role, "content": m.content} for m in req.messages]
    messages.extend(new_user_messages)

    reply_text = chat_completion(messages)

    # Persist new user messages + assistant reply
    _persist_messages(
        session_id,
        new_user_messages + [{"role": "assistant", "content": reply_text}],
    )

    return ChatResponse(
        session_id=session_id,
        message=ChatMessage(role="assistant", content=reply_text),
    )
