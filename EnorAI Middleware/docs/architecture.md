# EnorAI Architecture

EnorAI is a privacy-first healthcare AI middleware demo. It models a control layer between healthcare data sources and external AI systems, with a focus on the decisions that should happen before a request is routed to an AI API.

The current implementation is intentionally narrow: a Next.js console sends a demo payload to a FastAPI backend, and the backend returns a structured stage-by-stage middleware result. The processing stages are modular and mocked so the architecture can be reviewed without implying production readiness.

## System Context

```text
Healthcare source or operator
  -> EnorAI dashboard
  -> FastAPI middleware endpoint
  -> Mocked middleware stage services
  -> Structured middleware response
```

The demo does not call an external AI provider. The "AI API" shown in the frontend is a provider label selected by the routing stage.

## Problem Space

Healthcare AI integration requires more than sending clinical text to a model endpoint. A middleware layer should help answer operational questions before provider access:

- Is the caller allowed to submit this type of request?
- Does the payload contain patient identifiers that should be removed or tokenized?
- Is the destination intent allowed under the current policy?
- Which AI provider or route should handle the request?
- Did the request pass guardrail checks?
- Can the decision path be audited later?
- What risk or trust signal should downstream systems receive?

EnorAI demonstrates that control path. It does not implement a complete security, compliance, or clinical safety system.

## Runtime Flow

```text
POST /middleware/run
  input_channel
  raw_payload
  patient_context
  destination_intent

    |
    v

auth_check
  -> detect_and_tokenize_pii
  -> evaluate_policy
  -> select_provider
  -> apply_guardrails
  -> compute_trust_score
  -> create_audit_event

    |
    v

MiddlewareRunResponse
  request_id
  privacy result
  policy decision
  routing decision
  guardrail result
  trust score result
  audit event
  stage latencies
```

The frontend presents the flow in this conceptual order:

```text
Auth / API Gateway
  -> Privacy Engine
  -> Policy Engine
  -> AI Router
  -> Guardrails
  -> Trust Score
  -> Audit Log
```

## Stage Roles

### Auth / API Gateway

The auth stage represents the first middleware boundary. In a production design, this is where API keys, identity, tenant context, authorization, rate limits, and request provenance would be enforced.

Current demo behavior:

- Returns a mocked pass result.
- Does not validate credentials.
- Does not enforce tenant or user authorization.

### Privacy Engine

The privacy engine reduces exposure before provider routing. It scans the raw payload for common PII patterns and returns a de-identified payload plus token metadata.

Current demo behavior:

- Detects simple examples of names, phone numbers, IDs, and date of birth.
- Replaces detected values with tokens such as `[NAME_1]` and `[DOB_1]`.
- Produces a privacy risk level from the number of detected PII categories.

### Policy Engine

The policy engine decides whether the request should be allowed, reviewed, or denied before provider access.

Current demo behavior:

- Uses hard-coded destination intent and privacy risk logic.
- Returns `allow`, `review`, or `deny`.
- Includes a policy ID, reason, and required controls.

### AI Router

The router chooses the downstream AI API label after policy evaluation.

Current demo behavior:

- Selects a mocked provider label based on destination intent.
- Returns a blocked route if policy denies the request.
- Does not call external AI systems.

### Guardrails

Guardrails check the request state after policy and routing decisions.

Current demo behavior:

- Checks for a small set of blocked terms.
- Adds warnings when policy review is required or routing is blocked.
- Returns a pass or block result.

### Audit Logging

Audit logging records the middleware decision path for traceability.

Current demo behavior:

- Creates an audit event object with event ID, action, status, input channel, destination intent, provider, and trust score.
- Returns the audit event in the API response.
- Does not persist audit records to a database or external logging system.

### Trust Scoring

Trust scoring provides a compact signal based on privacy, policy, routing, and guardrail outcomes.

Current demo behavior:

- Starts from a baseline score and subtracts for risk signals.
- Returns a score between 0 and 1, a risk rating, and contributing signals.
- Is not a validated statistical, clinical, or compliance model.

## Backend Organization

```text
backend/app/
  main.py                  FastAPI application and route registration
  core/config.py           Product metadata and demo API settings
  api/middleware.py        POST /middleware/run route
  models/common.py         Shared model type aliases
  models/requests.py       Pydantic request model
  models/stage_results.py  Pydantic stage-result models
  models/responses.py      Pydantic response and latency models
  services/auth.py         Mock auth boundary
  services/privacy.py      PII detection and tokenization
  services/policy.py       Policy decision logic
  services/routing.py      Mock AI API routing
  services/guardrails.py   Guardrail checks
  services/trust.py        Trust score logic
  services/audit.py        Audit event creation
  services/pipeline.py     Stage orchestration and latency timing
```

## Frontend Organization

```text
frontend/src/
  app/page.tsx                          Dashboard layout composition
  hooks/useMiddlewareDemo.ts            Demo state and run orchestration
  components/AppHeader.tsx              Product header
  components/InputMethodsPanel.tsx      Input controls
  components/PipelineVisualization.tsx  Stage display
  components/ResultsPanel.tsx           Structured response rendering
  lib/middleware/client.ts              Backend API client
  lib/middleware/types.ts               Frontend middleware contract types
  lib/middleware/pipeline.ts            Pipeline stage definitions and status logic
  lib/middleware/demo-inputs.ts         Demo seed inputs
  lib/middleware/patient-context.ts     JSON patient-context parsing
```

## Current Demo Limitations

- The system is a demo and should not be treated as production-ready.
- Authentication and authorization are not implemented.
- De-identification is regex-based and incomplete.
- Policy evaluation is hard-coded.
- AI routing is simulated.
- Guardrails are simplified and request-only.
- Audit events are not persisted.
- Trust scoring is a deterministic demo heuristic.
- No database, message queue, secrets manager, clinical terminology service, monitoring stack, or deployment hardening is included.
- No healthcare compliance claims are made by this implementation.

## Future Roadmap

Recommended next steps:

- Add unit tests for each service and integration tests for `POST /middleware/run`.
- Define a versioned middleware schema for stable frontend/backend contracts.
- Replace regex-only PII handling with a structured de-identification service.
- Move policy logic into configurable rules with clear review states.
- Add provider adapter interfaces and explicit provider capability metadata.
- Add response-side guardrails before returning AI output to healthcare applications.
- Persist audit events with retention, access controls, and review workflows.
- Add authentication, authorization, tenant isolation, and secrets management.
- Add telemetry for latency, policy outcomes, guardrail outcomes, and provider routing.
- Define deployment, compliance, and security requirements before any production use.
