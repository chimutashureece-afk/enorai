export function parsePatientContext(jsonPayload: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(jsonPayload) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }

    return {};
  } catch {
    return {
      raw_context: jsonPayload,
    };
  }
}

