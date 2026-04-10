import type { MiddlewareRunResponse, StageLatency } from "./types";

export type PipelineStageStatus = "idle" | "loading" | "complete" | "blocked";

export type PipelineStageDefinition = {
  key: string;
  label: string;
};

export type PipelineStage = PipelineStageDefinition & {
  status: PipelineStageStatus;
  latencyMs?: number;
};

export const PIPELINE_STAGES: PipelineStageDefinition[] = [
  { key: "auth_check", label: "Auth / API Gateway" },
  { key: "detect_and_tokenize_pii", label: "Privacy Engine" },
  { key: "evaluate_policy", label: "Policy Engine" },
  { key: "select_provider", label: "AI Router" },
  { key: "apply_guardrails", label: "Guardrails" },
  { key: "compute_trust_score", label: "Trust Score" },
  { key: "create_audit_event", label: "Audit Log" },
];

export function buildPipelineStages({
  activeStageIndex,
  isRunning,
  result,
}: {
  activeStageIndex: number | null;
  isRunning: boolean;
  result: MiddlewareRunResponse | null;
}): PipelineStage[] {
  return PIPELINE_STAGES.map((stage, index) => ({
    ...stage,
    status: getStageStatus(index, activeStageIndex, isRunning, result),
    latencyMs: findLatency(result?.stage_latencies, stage.key),
  }));
}

function findLatency(latencies: StageLatency[] | undefined, stage: string) {
  return latencies?.find((latency) => latency.stage === stage)?.milliseconds;
}

function getStageStatus(
  index: number,
  activeStageIndex: number | null,
  isRunning: boolean,
  result: MiddlewareRunResponse | null,
): PipelineStageStatus {
  if (result) {
    const policyBlocked = result.policy.status === "deny";
    if (policyBlocked && index > 2) {
      return "blocked";
    }

    return "complete";
  }

  if (!isRunning || activeStageIndex === null) {
    return "idle";
  }

  if (index < activeStageIndex) {
    return "complete";
  }

  if (index === activeStageIndex) {
    return "loading";
  }

  return "idle";
}

