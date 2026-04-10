from collections.abc import Callable
from time import perf_counter
from typing import TypeVar
from uuid import uuid4

from app.core.config import PRODUCT_NAME, PRODUCT_TAGLINE
from app.models.requests import MiddlewareRunRequest
from app.models.responses import MiddlewareRunResponse, StageLatency
from app.services.audit import create_audit_event
from app.services.auth import auth_check
from app.services.guardrails import apply_guardrails
from app.services.policy import evaluate_policy
from app.services.privacy import detect_and_tokenize_pii
from app.services.routing import select_provider
from app.services.trust import compute_trust_score

T = TypeVar("T")


def _measure(stage: str, latencies: list[StageLatency], callback: Callable[[], T]) -> T:
    started_at = perf_counter()
    result = callback()
    elapsed_ms = round((perf_counter() - started_at) * 1000, 3)
    latencies.append(StageLatency(stage=stage, milliseconds=elapsed_ms))
    return result


def run_middleware_pipeline(request: MiddlewareRunRequest) -> MiddlewareRunResponse:
    request_id = f"req_{uuid4().hex}"
    latencies: list[StageLatency] = []
    started_at = perf_counter()

    auth = _measure("auth_check", latencies, lambda: auth_check(request))
    privacy = _measure(
        "detect_and_tokenize_pii",
        latencies,
        lambda: detect_and_tokenize_pii(request),
    )
    policy = _measure(
        "evaluate_policy",
        latencies,
        lambda: evaluate_policy(request, privacy),
    )
    routing = _measure(
        "select_provider",
        latencies,
        lambda: select_provider(request, policy),
    )
    guardrails = _measure(
        "apply_guardrails",
        latencies,
        lambda: apply_guardrails(privacy, policy, routing),
    )
    trust_score = _measure(
        "compute_trust_score",
        latencies,
        lambda: compute_trust_score(privacy, policy, routing, guardrails),
    )
    audit_event = _measure(
        "create_audit_event",
        latencies,
        lambda: create_audit_event(request, policy, routing, guardrails, trust_score),
    )

    total_latency_ms = round((perf_counter() - started_at) * 1000, 3)

    return MiddlewareRunResponse(
        request_id=request_id,
        product=PRODUCT_NAME,
        tagline=PRODUCT_TAGLINE,
        auth=auth,
        privacy=privacy,
        policy=policy,
        routing=routing,
        guardrails=guardrails,
        trust_score=trust_score,
        audit_event=audit_event,
        stage_latencies=latencies,
        total_latency_ms=total_latency_ms,
    )
