import type { MiddlewareRunResponse } from "@/lib/middleware/types";

export function ResultsPanel({
  result,
  error,
}: {
  result: MiddlewareRunResponse | null;
  error: string | null;
}) {
  return (
    <section className="space-y-5">
      <div>
        <p className="eyebrow">Results panel</p>
        <h2 className="mt-2 text-lg font-semibold text-ink">
          Structured middleware output
        </h2>
      </div>

      {error ? (
        <div className="rounded border border-signal bg-white px-4 py-3 text-sm text-signal">
          {error}
        </div>
      ) : null}

      {!result ? (
        <div className="rounded border border-line bg-white px-4 py-10 text-center text-sm text-muted">
          Run the middleware demo to inspect de-identification, policy,
          routing, guardrails, audit, and trust scoring output.
        </div>
      ) : (
        <div className="space-y-4">
          <ResultBlock title="De-identified payload">
            <pre className="whitespace-pre-wrap text-sm leading-6">
              {result.privacy.redacted_payload}
            </pre>
          </ResultBlock>

          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label="Policy decision" value={result.policy.status} />
            <Metric label="AI API" value={result.routing.provider ?? "Blocked"} />
            <Metric
              label="Guardrail result"
              value={result.guardrails.passed ? "Passed" : "Blocked"}
            />
            <Metric
              label="Trust score"
              value={`${Math.round(result.trust_score.score * 100)} / 100`}
            />
            <Metric label="Risk level" value={result.privacy.risk_level} />
            <Metric
              label="Latency"
              value={`${result.total_latency_ms.toFixed(3)} ms`}
            />
          </div>

          <ResultBlock title="Audit summary">
            <dl className="space-y-2 text-sm">
              <Row label="Event ID" value={result.audit_event.event_id} />
              <Row label="Status" value={result.audit_event.status} />
              <Row label="Action" value={result.audit_event.action} />
              <Row label="Intent" value={result.audit_event.destination_intent} />
            </dl>
          </ResultBlock>

          <ResultBlock title="Signals">
            <ul className="space-y-2 text-sm text-muted">
              {result.trust_score.signals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </ResultBlock>
        </div>
      )}
    </section>
  );
}

function ResultBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded border border-line bg-white px-4 py-4">
      <p className="mb-3 text-sm font-semibold text-ink">{title}</p>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-white px-4 py-3">
      <p className="text-xs uppercase text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold capitalize text-ink">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[96px_1fr]">
      <dt className="text-muted">{label}</dt>
      <dd className="break-words text-ink">{value}</dd>
    </div>
  );
}
