import { NextRequest, NextResponse } from "next/server";
import { loadSimulationState, saveSimulationState } from "@/lib/storage";

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const state = await loadSimulationState();
  state.config = {
    ...state.config,
    ...body,
    systems: {
      ...state.config.systems,
      ...(body.systems ?? {})
    }
  };
  await saveSimulationState(state);
  return NextResponse.json(state);
}
