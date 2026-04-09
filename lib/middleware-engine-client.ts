export type MiddlewareEngineResult = {
  response: string;
  trust_score?: number;
};

function getMiddlewareEngineUrl() {
  return process.env.MIDDLEWARE_ENGINE_URL ?? "http://127.0.0.1:8000";
}

export async function runMiddlewareEngine(message: string): Promise<MiddlewareEngineResult> {
  const response = await fetch(`${getMiddlewareEngineUrl()}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
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
}
