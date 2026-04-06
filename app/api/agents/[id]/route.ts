import { NextRequest, NextResponse } from "next/server";
import { loadSimulationState, saveSimulationState } from "@/lib/storage";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const body = await request.json();
  const { id } = await context.params;
  const state = await loadSimulationState();
  const agent = state.agents.find((item) => item.id === id);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  Object.assign(agent, {
    ...body,
    traits: {
      ...agent.traits,
      ...(body.traits ?? {})
    },
    urges: {
      ...agent.urges,
      ...(body.urges ?? {})
    },
    resources: {
      ...agent.resources,
      ...(body.resources ?? {})
    }
  });

  await saveSimulationState(state);
  return NextResponse.json(agent);
}
