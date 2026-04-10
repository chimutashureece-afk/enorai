from typing import Any

from pydantic import BaseModel, Field


class MiddlewareRunRequest(BaseModel):
    input_channel: str = Field(
        ...,
        examples=["ehr_summary"],
        description="Source channel or integration sending the request.",
    )
    raw_payload: str = Field(
        ...,
        min_length=1,
        description="Healthcare-related payload before middleware processing.",
    )
    patient_context: dict[str, Any] = Field(
        default_factory=dict,
        description="Structured patient context supplied by the source system.",
    )
    destination_intent: str = Field(
        ...,
        examples=["external_ai_summarization"],
        description="Intended external AI use case or destination purpose.",
    )

