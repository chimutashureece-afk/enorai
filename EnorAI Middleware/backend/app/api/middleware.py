from fastapi import APIRouter

from app.models.requests import MiddlewareRunRequest
from app.models.responses import MiddlewareRunResponse
from app.services.pipeline import run_middleware_pipeline

router = APIRouter(prefix="/middleware", tags=["middleware"])


@router.post("/run", response_model=MiddlewareRunResponse)
def run_middleware(request: MiddlewareRunRequest) -> MiddlewareRunResponse:
    return run_middleware_pipeline(request)
