import { useState } from "react";
import { api, ChatMessage } from "../lib/api";

interface Props {
  reportId?: string;
  videoId?: string;
}

export default function Chat({ reportId, videoId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await api.chat(next, { report_id: reportId, video_id: videoId });
      setMessages([...next, res.message]);
    } catch (e) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: `Error: ${e instanceof Error ? e.message : String(e)}`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xs font-semibold uppercase text-aegis-muted mb-2">
        Chat
      </h3>
      <div className="flex-1 min-h-0 overflow-auto space-y-2 text-xs pr-1">
        {messages.length === 0 && (
          <p className="text-aegis-muted">
            Ask a question about this site, e.g. "What's the biggest risk here?"
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-md p-2 ${
              m.role === "user"
                ? "bg-slate-700/60 text-slate-100"
                : "bg-aegis-accent/20 text-slate-100"
            }`}
          >
            <div className="text-[10px] uppercase opacity-60">{m.role}</div>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
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
          disabled={busy}
          className="flex-1 rounded-md bg-slate-800 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-aegis-accent"
        />
        <button
          onClick={() => void send()}
          disabled={busy || !input.trim()}
          className="rounded-md bg-aegis-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}
