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

type OpenAIResponsesApiResult = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
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

function getApiKey() {
  return process.env.OPENAI_API_KEY ?? null;
}

function getModel() {
  return process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
}

function detectRisk(text: string) {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
}

function extractOpenAIText(response: OpenAIResponsesApiResult) {
  if (response.output_text?.trim()) {
    return response.output_text.trim();
  }

  const firstText = response.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text" && typeof content.text === "string")
    ?.text;

  return firstText?.trim() ?? "";
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

async function generateOpenAIReply(messages: ChatMessage[]) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }

  const transcript = messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join("\n");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: getModel(),
      instructions: SYSTEM_PROMPT,
      input: `Conversation:\n${transcript}\n\nRespond to the last USER message only.`,
      max_output_tokens: 220
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with ${response.status}`);
  }

  const data = (await response.json()) as OpenAIResponsesApiResult;
  return extractOpenAIText(data);
}

export async function generateSupportReply(messages: ChatMessage[]): Promise<ChatResult> {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";

  if (detectRisk(latestUserMessage)) {
    return buildCrisisResponse(latestUserMessage);
  }

  try {
    const text = await generateOpenAIReply(messages);
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
