from app.models.requests import MiddlewareRunRequest
from app.models.stage_results import PolicyDecision, RoutingDecision


def select_provider(
    request: MiddlewareRunRequest,
    policy: PolicyDecision,
) -> RoutingDecision:
    if policy.status == "deny":
        return RoutingDecision(
            provider=None,
            route="blocked",
            reason="Policy denied the request before provider selection.",
        )

    intent = request.destination_intent.lower()
    provider = "demo-clinical-summary-provider"
    if "classification" in intent or "triage" in intent:
        provider = "demo-healthcare-classification-provider"

    return RoutingDecision(
        provider=provider,
        route="external_ai_demo_route",
        reason="Selected a mocked provider route based on destination intent.",
    )
