from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.middleware import router as middleware_router
from app.core.config import (
    API_TITLE,
    API_VERSION,
    DEMO_CORS_ORIGINS,
    PLATFORM_CAPABILITIES,
    PRODUCT_NAME,
    PRODUCT_TAGLINE,
)

app = FastAPI(
    title=API_TITLE,
    description=PRODUCT_TAGLINE,
    version=API_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=DEMO_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(middleware_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": API_TITLE}


@app.get("/platform")
def platform_summary() -> dict[str, object]:
    return {
        "product": PRODUCT_NAME,
        "tagline": PRODUCT_TAGLINE,
        "capabilities": PLATFORM_CAPABILITIES,
    }
