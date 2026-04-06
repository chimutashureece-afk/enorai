import { GoogleGenAI, Type } from "@google/genai";
import { buildAgentTurnPrompt } from "@/lib/prompts";
import { decisionSchema } from "@/lib/simulation/schema";
import { AgentDecision, AgentProfile, SimulationState } from "@/lib/types";

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

export async function generateGeminiDecision(agent: AgentProfile, state: SimulationState): Promise<AgentDecision | null> {
  const ai = getClient();
  if (!ai) {
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildAgentTurnPrompt(agent, state),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            private_thought: { type: Type.STRING },
            dominant_urge: { type: Type.STRING },
            dominant_emotion: { type: Type.STRING },
            primary_goal: { type: Type.STRING },
            life_direction_choice: { type: Type.STRING, nullable: true },
            action: { type: Type.STRING },
            target: { type: Type.STRING, nullable: true },
            speech: { type: Type.STRING, nullable: true },
            belief_update: { type: Type.STRING },
            expected_reward: {
              type: Type.OBJECT,
              properties: {
                survival: { type: Type.NUMBER },
                productivity: { type: Type.NUMBER },
                status: { type: Type.NUMBER },
                reproduction: { type: Type.NUMBER },
                legacy: { type: Type.NUMBER }
              },
              required: ["survival", "productivity", "status", "reproduction", "legacy"]
            },
            confidence: { type: Type.NUMBER }
          },
          required: [
            "private_thought",
            "dominant_urge",
            "dominant_emotion",
            "primary_goal",
            "life_direction_choice",
            "action",
            "target",
            "speech",
            "belief_update",
            "expected_reward",
            "confidence"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) {
      return null;
    }

    const parsed = decisionSchema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
