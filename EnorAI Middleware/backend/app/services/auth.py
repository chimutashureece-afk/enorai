from app.models.requests import MiddlewareRunRequest
from app.models.stage_results import AuthResult


def auth_check(request: MiddlewareRunRequest) -> AuthResult:
    return AuthResult(
        passed=True,
        mode="demo_bypass",
        reason=(
            "Authentication is not enabled in this demo. The stage is present "
            "as a middleware boundary for future integration."
        ),
    )
