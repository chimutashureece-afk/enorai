from pydantic import BaseModel, Field

from app.models.common import DecisionStatus, RiskLevel


class AuthResult(BaseModel):
    passed: bool
    mode: str
    reason: str


class PrivacyResult(BaseModel):
    redacted_payload: str
    tokenized_fields: dict[str, list[str]]
    pii_types_detected: list[str]
    risk_level: RiskLevel


class PolicyDecision(BaseModel):
    status: DecisionStatus
    policy_id: str
    reason: str
    required_controls: list[str]


class RoutingDecision(BaseModel):
    provider: str | None
    route: str
    reason: str


class GuardrailResult(BaseModel):
    passed: bool
    blocked_terms: list[str]
    warnings: list[str]


class TrustScoreResult(BaseModel):
    score: float = Field(..., ge=0, le=1)
    rating: RiskLevel
    signals: list[str]


class AuditEvent(BaseModel):
    event_id: str
    action: str
    status: str
    input_channel: str
    destination_intent: str
    provider: str | None
    trust_score: float

