import type { MiddlewareRunRequest, MiddlewareRunResponse } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_ENORAI_API_URL ?? "http://127.0.0.1:8000";

export async function runMiddlewareDemo(
  payload: MiddlewareRunRequest,
): Promise<MiddlewareRunResponse> {
  const response = await fetch(`${API_BASE_URL}/middleware/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Middleware request failed with ${response.status}`);
  }

  return response.json() as Promise<MiddlewareRunResponse>;
}

