from fastapi import APIRouter

from app.schemas import ChatMessage, ChatRequest, ChatResponse
from app.services.vlm import chat_completion

router = APIRouter(prefix="/chat", tags=["chat"])

SYSTEM_PROMPT = (
    "You are AEGIS, an AI assistant embedded in a disaster-assessment tool. "
    "Answer questions about damage reports and video findings concisely, "
    "prioritizing responder safety and actionable next steps."
)


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    messages: list[dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]
    if req.report_id:
        messages.append(
            {"role": "system", "content": f"Active report_id: {req.report_id}"}
        )
    if req.video_id:
        messages.append(
            {"role": "system", "content": f"Active video_id: {req.video_id}"}
        )
    messages.extend({"role": m.role, "content": m.content} for m in req.messages)

    reply = chat_completion(messages)
    return ChatResponse(message=ChatMessage(role="assistant", content=reply))
