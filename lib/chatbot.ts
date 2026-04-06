import { GoogleGenAI } from "@google/genai";

export type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type ChatResult = {
  reply: string;
  riskLevel: "low" | "high";
  suggestions: string[];
  safetyNote?: string;
};

const CRISIS_PATTERNS = [
  /suicide/i,
  /kill myself/i,
  /end my life/i,
  /self[- ]harm/i,
  /hurt myself/i,
  /don't want to live/i,
  /i want to die/i,
  /overdose/i,
  /abuse/i,
  /unsafe at home/i
];

const SYSTEM_PROMPT = `
You are Solace, a therapeutic mental health support chatbot intended for medically sensitive settings.

Rules:
- You are not a doctor, therapist, psychiatrist, or crisis responder.
- Do not diagnose.
- Do not prescribe medication or treatment plans.
- Do not claim clinical certainty.
- Use calm, professional, therapeutic language.
- Keep responses under 170 words.
- Validate feelings without exaggeration.
- Ask at most one brief follow-up question when needed.
- Offer one or two practical next steps such as grounding, reflection, journaling, or reaching out to support.
- If there is any mention of self-harm, suicide, abuse, immediate danger, or inability to stay safe, tell the user to contact local emergency services or a crisis line immediately and encourage reaching a trusted person nearby now.
`.trim();

let client: GoogleGenAI | null = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  return client;
}

function detectRisk(text: string) {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
}

function buildCrisisResponse(userText: string): ChatResult {
  const directRisk = /kill myself|end my life|i want to die|suicide|overdose/i.test(userText);

  return {
    reply: directRisk
      ? "I am glad you said this clearly. I cannot help with harming yourself, and this needs immediate human support now. Please call your local emergency number or crisis line right away, and if possible move toward a trusted person and tell them you need urgent help."
      : "What you described sounds serious and needs human support now. Please contact local emergency services or a crisis line immediately, and reach out to a trusted person nearby if you can.",
    riskLevel: "high",
    suggestions: [],
    safetyNote:
      "If you may act on thoughts of self-harm, feel unable to stay safe, or are in immediate danger, contact emergency services or a crisis hotline right now."
  };
}

function buildFallbackResponse(userText: string): ChatResult {
  const lower = userText.toLowerCase();

  let reply =
    "That sounds difficult. Let us slow the moment down. Describe three things only: what happened, what you feel in your body right now, and what kind of support you need first.";

  if (lower.includes("anx") || lower.includes("panic") || lower.includes("overwhelm")) {
    reply =
      "Your system may be overloaded right now. Try this first: relax your jaw, lower your shoulders, and breathe out slowly for six counts five times. After that, tell me the single thought that feels loudest.";
  } else if (lower.includes("sad") || lower.includes("depress") || lower.includes("empty")) {
    reply =
      "This sounds heavy. Do not try to solve everything at once. Start with one feeling word, one small act of care you can do in the next ten minutes, and one person or place that feels a little safer.";
  } else if (lower.includes("sleep") || lower.includes("night")) {
    reply =
      "When the night feels intense, make the next two minutes simple: dim the room, put the phone down, and do one slow body scan from forehead to feet while lengthening each exhale.";
  }

  return {
    reply,
    riskLevel: "low",
    suggestions: [],
    safetyNote:
      "This chatbot provides therapeutic support only. It is not for diagnosis, medication advice, or emergency care."
  };
}

export async function generateSupportReply(messages: ChatMessage[]): Promise<ChatResult> {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";

  if (detectRisk(latestUserMessage)) {
    return buildCrisisResponse(latestUserMessage);
  }

  const ai = getClient();
  if (!ai) {
    return buildFallbackResponse(latestUserMessage);
  }

  try {
    const transcript = messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join("\n");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${SYSTEM_PROMPT}\n\nConversation:\n${transcript}\n\nRespond to the last USER message only.`,
      config: {
        temperature: 0.45
      }
    });

    const text = response.text?.trim();
    if (!text) {
      return buildFallbackResponse(latestUserMessage);
    }

    return {
      reply: text,
      riskLevel: "low",
      suggestions: [],
      safetyNote:
        "This chatbot provides therapeutic support only. It is not for diagnosis, medication advice, or emergency care."
    };
  } catch {
    return buildFallbackResponse(latestUserMessage);
  }
}
