import { NextRequest, NextResponse } from "next/server";
import { generateSupportReply, type ChatMessage } from "@/lib/chatbot";
import { runMiddlewareEngine } from "@/lib/middleware-engine-client";
import { recordMiddlewareLog } from "@/lib/middleware-monitor";

type ChatPayload = {
  messages?: ChatMessage[];
};

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const body = (await request.json()) as ChatPayload;
  const messages = body.messages ?? [];

  if (!messages.length) {
    return NextResponse.json({ error: "At least one message is required." }, { status: 400 });
  }

  const invalidMessage = messages.find(
    (message) =>
      (message.role !== "assistant" && message.role !== "user") ||
      typeof message.content !== "string" ||
      !message.content.trim()
  );

  if (invalidMessage) {
    return NextResponse.json({ error: "Messages must contain a valid role and non-empty content." }, { status: 400 });
  }

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content?.trim();
  if (!latestUserMessage) {
    return NextResponse.json({ error: "A user message is required." }, { status: 400 });
  }

  try {
    const middlewareResult = await runMiddlewareEngine(latestUserMessage);
    const riskLevel =
      middlewareResult.trust_score !== undefined && middlewareResult.trust_score < 0.4 ? "high" : "low";

    await recordMiddlewareLog({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      requestSource: "middleware-engine",
      latestUserMessage,
      trustScore: middlewareResult.trust_score,
      riskLevel,
      durationMs: Date.now() - startedAt,
      status: "success",
      detail: "Response served from Python middleware engine."
    });

    return NextResponse.json({
      reply: middlewareResult.response,
      riskLevel,
      suggestions: [],
      safetyNote:
        riskLevel === "high"
          ? "The middleware engine flagged this exchange as low confidence. Review the response carefully and escalate to human support if needed."
          : undefined,
      trustScore: middlewareResult.trust_score
    });
  } catch (error) {
    const fallbackResult = await generateSupportReply(messages);
    await recordMiddlewareLog({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      requestSource: "fallback",
      latestUserMessage,
      riskLevel: fallbackResult.riskLevel,
      durationMs: Date.now() - startedAt,
      status: "fallback",
      detail: error instanceof Error ? error.message : "Middleware engine unavailable. Served fallback response."
    });

    return NextResponse.json({
      ...fallbackResult,
      fallback: true
    });
  }
}
