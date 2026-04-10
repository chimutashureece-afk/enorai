from app.models.stage_results import (
    GuardrailResult,
    PolicyDecision,
    PrivacyResult,
    RoutingDecision,
    TrustScoreResult,
)


def compute_trust_score(
    privacy: PrivacyResult,
    policy: PolicyDecision,
    routing: RoutingDecision,
    guardrails: GuardrailResult,
) -> TrustScoreResult:
    score = 0.92
    signals = ["demo_auth_boundary_present", "audit_event_created"]

    if privacy.pii_types_detected:
        score -= 0.08
        signals.append("pii_tokenized")

    if privacy.risk_level == "high":
        score -= 0.12
        signals.append("high_privacy_risk")

    if policy.status == "review":
        score -= 0.1
        signals.append("policy_review_required")
    elif policy.status == "deny":
        score -= 0.35
        signals.append("policy_denied")

    if routing.route == "blocked":
        score -= 0.1
        signals.append("provider_route_blocked")

    if not guardrails.passed:
        score -= 0.2
        signals.append("guardrail_failed")

    score = max(0, min(1, round(score, 2)))
    rating = "low" if score >= 0.8 else "medium" if score >= 0.55 else "high"

    return TrustScoreResult(score=score, rating=rating, signals=signals)
