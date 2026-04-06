"use client";

import { FormEvent, useState } from "react";
import { AlertTriangle, LoaderCircle } from "lucide-react";

type Role = "assistant" | "user";

type ChatMessage = {
  role: Role;
  content: string;
};

type ChatApiResponse = {
  reply: string;
  riskLevel: "low" | "high";
  suggestions: string[];
  safetyNote?: string;
};

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hello. I am Solace. Share what is happening, and I will respond with focused therapeutic support."
  }
];

export function Dashboard() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [riskLevel, setRiskLevel] = useState<"low" | "high">("low");
  const [safetyNote, setSafetyNote] = useState<string | null>(null);

  async function sendMessage() {
    const nextInput = input.trim();
    if (!nextInput || pending) return;

    const nextMessages = [...messages, { role: "user" as const, content: nextInput }];
    setMessages(nextMessages);
    setInput("");
    setPending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: nextMessages })
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with ${response.status}`);
      }

      const data = (await response.json()) as ChatApiResponse;
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
      setRiskLevel(data.riskLevel);
      setSafetyNote(data.safetyNote ?? null);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "There was a temporary issue. Please try again with one short message about what feels most difficult right now."
        }
      ]);
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  return (
    <main className="therapy-shell">
      <section className="chat-card">
        <div className="chat-card-header">
          <div>
            <p className="brand-mark">Solace</p>
            <h1>Therapeutic Chat</h1>
          </div>
          <div className="status-orb" aria-hidden="true" />
        </div>

        <div className="message-stack">
          {messages.map((message, index) => (
            <article
              key={`${message.role}-${index}`}
              className={message.role === "assistant" ? "message assistant-message" : "message user-message"}
            >
              <span className="message-label">{message.role === "assistant" ? "Solace" : "You"}</span>
              <p>{message.content}</p>
            </article>
          ))}

          {pending ? (
            <article className="message assistant-message pending-message">
              <p>
                <LoaderCircle size={16} className="spin" /> Thinking...
              </p>
            </article>
          ) : null}
        </div>

        {riskLevel === "high" && safetyNote ? (
          <div className="safety-note">
            <AlertTriangle size={16} />
            <span>{safetyNote}</span>
          </div>
        ) : null}

        <form className="composer" onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={5}
            placeholder="Write your message..."
          />
          <div className="composer-row">
            <button className="send-button" type="submit" disabled={pending || !input.trim()}>
              Send
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
