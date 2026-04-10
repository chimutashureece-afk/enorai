from app.models.stage_results import (
    GuardrailResult,
    PolicyDecision,
    PrivacyResult,
    RoutingDecision,
)


BLOCKED_TERMS = {"password", "api_key", "secret"}


def apply_guardrails(
    privacy: PrivacyResult,
    policy: PolicyDecision,
    routing: RoutingDecision,
) -> GuardrailResult:
    payload_lower = privacy.redacted_payload.lower()
    blocked_terms = sorted(term for term in BLOCKED_TERMS if term in payload_lower)
    warnings: list[str] = []

    if policy.status == "review":
        warnings.append("Policy requires review because the request contained multiple PII categories.")

    if routing.route == "blocked":
        warnings.append("Routing was blocked before external provider access.")

    return GuardrailResult(
        passed=not blocked_terms and policy.status != "deny",
        blocked_terms=blocked_terms,
        warnings=warnings,
    )
