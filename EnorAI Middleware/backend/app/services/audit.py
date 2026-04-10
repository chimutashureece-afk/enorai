from uuid import uuid4

from app.models.requests import MiddlewareRunRequest
from app.models.stage_results import (
    AuditEvent,
    GuardrailResult,
    PolicyDecision,
    RoutingDecision,
    TrustScoreResult,
)


def create_audit_event(
    request: MiddlewareRunRequest,
    policy: PolicyDecision,
    routing: RoutingDecision,
    guardrails: GuardrailResult,
    trust_score: TrustScoreResult,
) -> AuditEvent:
    status = "blocked" if policy.status == "deny" or not guardrails.passed else "recorded"

    return AuditEvent(
        event_id=f"audit_{uuid4().hex}",
        action="middleware.run",
        status=status,
        input_channel=request.input_channel,
        destination_intent=request.destination_intent,
        provider=routing.provider,
        trust_score=trust_score.score,
    )
