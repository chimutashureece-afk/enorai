import type {
  PipelineStage,
  PipelineStageStatus,
} from "@/lib/middleware/pipeline";

const statusLabel: Record<PipelineStageStatus, string> = {
  idle: "Waiting",
  loading: "Running",
  complete: "Complete",
  blocked: "Blocked",
};

export function PipelineVisualization({ stages }: { stages: PipelineStage[] }) {
  return (
    <section className="space-y-5">
      <div>
        <p className="eyebrow">Middleware pipeline</p>
        <h2 className="mt-2 text-lg font-semibold text-ink">
          Request control path
        </h2>
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => (
          <div className="flex gap-3" key={stage.key}>
            <div className="flex w-9 flex-col items-center">
              <div
                className={`grid h-8 w-8 place-items-center rounded border text-xs font-semibold ${statusClass(
                  stage.status,
                )}`}
              >
                {index + 1}
              </div>
              {index < stages.length - 1 ? (
                <div className="mt-2 h-8 w-px bg-line" />
              ) : null}
            </div>
            <div className="min-h-14 flex-1 rounded border border-line bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-ink">{stage.label}</p>
                <p className="text-xs font-medium text-muted">
                  {statusLabel[stage.status]}
                </p>
              </div>
              <p className="mt-2 text-xs text-muted">
                {stage.latencyMs === undefined
                  ? "Latency pending"
                  : `${stage.latencyMs.toFixed(3)} ms`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function statusClass(status: PipelineStageStatus) {
  if (status === "loading") {
    return "border-clinic bg-clinic text-white";
  }

  if (status === "complete") {
    return "border-ink bg-ink text-white";
  }

  if (status === "blocked") {
    return "border-signal bg-signal text-white";
  }

  return "border-line bg-panel text-muted";
}
