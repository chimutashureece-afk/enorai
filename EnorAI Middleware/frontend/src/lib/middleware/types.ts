export type MiddlewareRunRequest = {
  input_channel: string;
  raw_payload: string;
  patient_context: Record<string, unknown>;
  destination_intent: string;
};

export type RiskLevel = "low" | "medium" | "high";
export type PolicyStatus = "allow" | "review" | "deny";

export type StageLatency = {
  stage: string;
  milliseconds: number;
};

export type MiddlewareRunResponse = {
  request_id: string;
  product: string;
  tagline: string;
  privacy: {
    redacted_payload: string;
    tokenized_fields: Record<string, string[]>;
    pii_types_detected: string[];
    risk_level: RiskLevel;
  };
  policy: {
    status: PolicyStatus;
    policy_id: string;
    reason: string;
    required_controls: string[];
  };
  routing: {
    provider: string | null;
    route: string;
    reason: string;
  };
  guardrails: {
    passed: boolean;
    blocked_terms: string[];
    warnings: string[];
  };
  trust_score: {
    score: number;
    rating: RiskLevel;
    signals: string[];
  };
  audit_event: {
    event_id: string;
    action: string;
    status: string;
    input_channel: string;
    destination_intent: string;
    provider: string | null;
    trust_score: number;
  };
  stage_latencies: StageLatency[];
  total_latency_ms: number;
};

