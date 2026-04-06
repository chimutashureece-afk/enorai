import { NextRequest, NextResponse } from "next/server";
import { generateSupportReply, type ChatMessage } from "@/lib/chatbot";

type ChatPayload = {
  messages?: ChatMessage[];
};

export async function POST(request: NextRequest) {
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

  const result = await generateSupportReply(messages);
  return NextResponse.json(result);
}
