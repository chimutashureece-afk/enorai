import { NextRequest, NextResponse } from "next/server";
import { runSimulationTurns } from "@/lib/simulation/engine";
import { loadSimulationState, saveSimulationState } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({ count: 1 }));
  const count = typeof body.count === "number" ? Math.max(1, Math.min(body.count, 100)) : 1;
  const state = await loadSimulationState();
  const nextState = await runSimulationTurns(state, count);
  await saveSimulationState(nextState);
  return NextResponse.json(nextState);
}
