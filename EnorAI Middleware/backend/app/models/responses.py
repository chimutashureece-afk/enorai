from pydantic import BaseModel

from app.models.stage_results import (
    AuditEvent,
    AuthResult,
    GuardrailResult,
    PolicyDecision,
    PrivacyResult,
    RoutingDecision,
    TrustScoreResult,
)


class StageLatency(BaseModel):
    stage: str
    milliseconds: float


class MiddlewareRunResponse(BaseModel):
    request_id: str
    product: str
    tagline: str
    auth: AuthResult
    privacy: PrivacyResult
    policy: PolicyDecision
    routing: RoutingDecision
    guardrails: GuardrailResult
    trust_score: TrustScoreResult
    audit_event: AuditEvent
    stage_latencies: list[StageLatency]
    total_latency_ms: float

