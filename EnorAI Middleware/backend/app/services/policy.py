from app.models.requests import MiddlewareRunRequest
from app.models.stage_results import PolicyDecision, PrivacyResult


def evaluate_policy(
    request: MiddlewareRunRequest,
    privacy: PrivacyResult,
) -> PolicyDecision:
    blocked_intents = {"diagnosis_autonomy", "unsupported_clinical_decision"}

    if request.destination_intent.lower() in blocked_intents:
        return PolicyDecision(
            status="deny",
            policy_id="ENORAI-POL-001",
            reason="Destination intent is outside the approved demo middleware scope.",
            required_controls=["human_review", "request_blocked"],
        )

    if privacy.risk_level == "high":
        return PolicyDecision(
            status="review",
            policy_id="ENORAI-POL-002",
            reason="Multiple PII categories were detected and tokenized before routing.",
            required_controls=["de_identification", "audit_logging", "response_guardrails"],
        )

    return PolicyDecision(
        status="allow",
        policy_id="ENORAI-POL-003",
        reason="Request is eligible for demo routing after privacy filtering.",
        required_controls=["de_identification", "audit_logging"],
    )
