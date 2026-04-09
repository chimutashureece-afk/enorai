export type MiddlewareEngineResult = {
  response: string;
  trust_score?: number;
};

function getMiddlewareEngineUrl() {
  return process.env.MIDDLEWARE_ENGINE_URL?.trim() || "https://enorai.onrender.com";
}

function getFallbackMiddlewareUrl() {
  return "http://127.0.0.1:8000";
}

export async function runMiddlewareEngine(message: string): Promise<MiddlewareEngineResult> {
  const candidates = [getMiddlewareEngineUrl()];
  if (candidates[0] !== getFallbackMiddlewareUrl()) {
    candidates.push(getFallbackMiddlewareUrl());
  }

  let lastError: unknown;

  for (const baseUrl of candidates) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Middleware engine request failed with ${response.status}`);
      }

      const data = (await response.json()) as Partial<MiddlewareEngineResult> & { error?: string };
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.response || typeof data.response !== "string") {
        throw new Error("Middleware engine returned an invalid response");
      }

      return {
        response: data.response,
        trust_score: typeof data.trust_score === "number" ? data.trust_score : undefined
      };
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Middleware engine request failed");
}
