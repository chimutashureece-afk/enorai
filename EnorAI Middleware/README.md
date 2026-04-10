# EnorAI Middleware

Privacy-first healthcare AI middleware.

EnorAI is a technical demo of a middleware layer that sits between healthcare data sources and external AI systems. The project focuses on the control path that should exist before clinical or operational healthcare data is sent to an AI API: intake, de-identification, policy evaluation, routing, guardrails, audit logging, and trust scoring.

This repository is not a production healthcare system. It is a clean implementation scaffold for reviewing the architecture, API shape, and user-facing console of a healthcare AI middleware platform.

## Problem

Healthcare teams evaluating AI systems often need to move data across organizational and vendor boundaries. That creates several engineering and governance concerns:

- Requests may contain protected or unnecessary patient identifiers.
- Different use cases may require different data handling policies.
- External AI systems may not have the same risk profile, contractual controls, or intended use.
- Request and response behavior needs to be traceable for review.
- Downstream applications need a clear signal about trust, risk, and middleware decisions.

EnorAI models a middleware boundary for those concerns. It does not replace clinical review, compliance programs, access control systems, or production security controls.

## Current Demo

The demo contains:

- A Next.js dashboard in `frontend/` for submitting healthcare-related payloads and viewing stage-by-stage middleware output.
- A FastAPI service in `backend/` with `POST /middleware/run`.
- Architecture notes in `docs/`.

The backend endpoint accepts:

- `input_channel`
- `raw_payload`
- `patient_context`
- `destination_intent`

It returns a structured response containing:

- privacy result
- policy decision
- routing decision
- guardrail result
- audit event
- trust score result
- stage latency measurements

## Middleware Flow

```text
Healthcare source
  -> Auth / API Gateway
  -> Privacy Engine
  -> Policy Engine
  -> AI Router
  -> Guardrails
  -> Trust Score
  -> Audit Log
  -> Structured middleware response
```

### Stage Responsibilities

- Auth / API Gateway: represents the request boundary where authentication and API gateway controls would be enforced. In the current demo this stage is a mocked pass-through.
- Privacy Engine: detects and tokenizes common PII patterns such as names, phone numbers, patient IDs, and date of birth.
- Policy Engine: returns an allow, review, or deny decision based on mocked destination-intent and privacy-risk rules.
- AI Router: selects a mocked external AI API route or blocks routing when policy denies the request.
- Guardrails: checks the de-identified payload and policy outcome for blocked content and warnings.
- Audit Log: creates an in-memory audit event object for the middleware run. No database is used.
- Trust Score: calculates a demo score from policy, privacy, routing, and guardrail signals.

## Project Structure

```text
EnorAI Middleware/
  backend/
    app/
      api/        FastAPI route definitions
      core/       Product metadata and API configuration
      models/     Pydantic request, response, and stage-result models
      services/   Modular middleware stage functions
    requirements.txt
  frontend/
    src/app/       Next.js app entry
    src/components Modular dashboard components
    src/hooks      Dashboard orchestration hooks
    src/lib/       Middleware API client, types, and stage utilities
  docs/
    architecture.md
```

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will run at `http://127.0.0.1:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dashboard will run at `http://localhost:3000` and calls the backend at `http://127.0.0.1:8000` by default. Set `NEXT_PUBLIC_ENORAI_API_URL` if the API is hosted elsewhere.

## Demo Limitations

- Authentication is not implemented; the auth stage is a mocked boundary.
- PII detection uses simple regular expressions, not a clinical-grade de-identification engine.
- Policy rules are hard-coded demo logic.
- AI provider routing is mocked and does not call external AI APIs.
- Guardrails are simplified and only inspect the mocked request state.
- Audit events are returned in the response and are not persisted.
- Trust scoring is deterministic demo logic, not a validated risk model.
- No database, queue, secret management, user management, or production observability is included.
- The project has not been validated for HIPAA, clinical safety, regulatory compliance, or production deployment.

## Roadmap

Near-term technical work:

- Add request and response test coverage for `/middleware/run`.
- Add a typed OpenAPI-driven frontend client or shared schema contract.
- Expand PII detection with structured entity metadata and reversible token maps behind controlled access.
- Add configurable policy rules instead of hard-coded demo decisions.
- Add provider adapter interfaces without calling real providers by default.

Later platform work:

- Persist audit events to a database with retention and query controls.
- Add real authentication, authorization, tenant boundaries, and key management.
- Add richer guardrail checks for provider responses.
- Add operational telemetry, tracing, and reviewer workflows.
- Add deployment configuration after security and compliance requirements are defined.
