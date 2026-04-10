import re

from app.models.requests import MiddlewareRunRequest
from app.models.stage_results import PrivacyResult


NAME_PREFIX_PATTERN = re.compile(
    r"\b(?:Patient|Name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b"
)
NAME_PATTERN = re.compile(r"\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b")
PHONE_PATTERN = re.compile(r"(?<!\d)(?:\+?\d[\d\s().-]{7,}\d)(?!\d)")
ID_PATTERN = re.compile(
    r"\b(?:MRN|Patient ID|PatientID|ID|NHS|SSN)[:#\s-]*([A-Z0-9-]{4,})\b",
    re.IGNORECASE,
)
DOB_PATTERN = re.compile(
    r"\b(?:DOB|date of birth)[:\s-]*"
    r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b",
    re.IGNORECASE,
)


def _replace_matches(
    text: str,
    pattern: re.Pattern[str],
    label: str,
    tokens: dict[str, list[str]],
    group: int = 0,
) -> str:
    counter = 0

    def replace(match: re.Match[str]) -> str:
        nonlocal counter
        counter += 1
        token = f"[{label}_{counter}]"
        tokens.setdefault(label.lower(), []).append(token)

        if group == 0:
            return token

        start, end = match.span(group)
        relative_start = start - match.start()
        relative_end = end - match.start()
        original = match.group(0)
        return f"{original[:relative_start]}{token}{original[relative_end:]}"

    return pattern.sub(replace, text)


def detect_and_tokenize_pii(request: MiddlewareRunRequest) -> PrivacyResult:
    tokens: dict[str, list[str]] = {}
    redacted_payload = request.raw_payload
    redacted_payload = _replace_matches(redacted_payload, DOB_PATTERN, "DOB", tokens, 1)
    redacted_payload = _replace_matches(redacted_payload, PHONE_PATTERN, "PHONE", tokens)
    redacted_payload = _replace_matches(redacted_payload, ID_PATTERN, "ID", tokens, 1)
    redacted_payload = _replace_matches(redacted_payload, NAME_PREFIX_PATTERN, "NAME", tokens, 1)
    redacted_payload = _replace_matches(redacted_payload, NAME_PATTERN, "NAME", tokens)

    pii_types_detected = sorted(tokens.keys())
    risk_level = (
        "high"
        if len(pii_types_detected) >= 3
        else "medium"
        if pii_types_detected
        else "low"
    )

    return PrivacyResult(
        redacted_payload=redacted_payload,
        tokenized_fields=tokens,
        pii_types_detected=pii_types_detected,
        risk_level=risk_level,
    )
