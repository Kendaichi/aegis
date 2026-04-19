import { MessageSquareText, SendHorizontal, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type ChatMessage, type FrameAnalysis } from "../lib/api";
import { appendChatMessages, fetchChatMessages } from "../lib/supabaseQueries";

interface Props {
  reportId?: string;
  videoId?: string;
  frameContext?: FrameAnalysis | null;
  onClearFrameContext?: () => void;
}

function buildFrameSystemMessage(frame: FrameAnalysis): ChatMessage {
  const hazards = frame.detected_hazards.length
    ? ` Hazards: ${frame.detected_hazards.join(", ")}.`
    : "";
  return {
    role: "system",
    content:
      `User is asking about frame #${frame.frame_index} ` +
      `(severity=${frame.severity}, t=${frame.timestamp_seconds}s, ` +
      `confidence=${frame.confidence.toFixed(2)}): ${frame.description}${hazards}`,
  };
}

export default function Chat({
  reportId,
  videoId,
  frameContext,
  onClearFrameContext,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    setLoading(true);
    fetchChatMessages(videoId)
      .then(({ rows, sessionId: sid }) => {
        if (cancelled) return;
        setMessages(rows.map((r) => ({ role: r.role, content: r.content })));
        setSessionId(sid);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [videoId]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const next: ChatMessage[] = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const systemPrefix: ChatMessage[] = frameContext ? [buildFrameSystemMessage(frameContext)] : [];
      const res = await api.chat([...systemPrefix, ...next], {
        session_id: sessionId,
        report_id: reportId,
        video_id: videoId,
      });
      const assistantMsg = res.message;
      setSessionId(res.session_id);
      setMessages([...next, assistantMsg]);

      if (videoId) {
        await appendChatMessages(videoId, res.session_id, [
          { role: "user", content: text },
          { role: assistantMsg.role as "user" | "assistant", content: assistantMsg.content },
        ]);
      }
    } catch (error) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-aegis-accent" />
            <h3 className="section-title">Analyst Chat</h3>
          </div>
          <p className="mt-2 text-[12px] text-slate-500">
            Ask AEGIS about risks, findings, or frame-specific context.
          </p>
        </div>
        {frameContext && (
          <div className="rounded-2xl border border-aegis-border bg-aegis-surface2 px-3 py-2 text-right">
            <div className="text-[11px] text-slate-400">
              Frame #{frameContext.frame_index}{" "}
              <span className="uppercase text-slate-300">({frameContext.severity})</span>
            </div>
            {onClearFrameContext && (
              <button
                type="button"
                onClick={onClearFrameContext}
                className="mt-1 inline-flex items-center gap-1 text-[11px] text-aegis-accent transition hover:text-blue-300"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-auto pr-1">
        {loading && (
          <p className="text-[12px] text-slate-500">Loading chat history...</p>
        )}
        {!loading && messages.length === 0 && (
          <div className="rounded-card border border-dashed border-aegis-border bg-aegis-surface2/50 p-4 text-[13px] text-slate-400">
            What is the biggest risk here? Which frames suggest blocked access routes? What should
            responders prioritize first?
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`rounded-card border p-3 text-[13px] ${
              message.role === "user"
                ? "border-aegis-border bg-aegis-surface2 text-slate-100"
                : "border-aegis-accent/20 bg-aegis-glow text-slate-100"
            }`}
          >
            <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
              {message.role === "assistant" && <Sparkles className="h-3 w-3 text-aegis-accent" />}
              {message.role}
            </div>
            <div className="whitespace-pre-wrap leading-6">{message.content}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder={busy ? "Thinking..." : "Ask AEGIS..."}
          disabled={busy || loading}
          className="input-shell flex-1"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={busy || loading || !input.trim()}
          className="button-primary px-3"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
