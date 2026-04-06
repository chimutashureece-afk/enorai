import { AgentProfile, SimulationState } from "@/lib/types";

export function buildUniversalPrompt(state: SimulationState): string {
  const { config, world } = state;
  return [
    config.universalSimulationPrompt,
    `World premise: ${config.worldPremise}`,
    `Historical conditions: ${config.historicalStartingConditions}`,
    `Scarcity: ${config.scarcityLevel}/10`,
    `Violence: ${config.violenceLevel}/10`,
    `Fertility environment: ${config.fertilityLevel}/10`,
    `Institutional strength: ${config.institutionalStrength}/10`,
    `Law strictness: ${config.lawStrictness}/10`,
    `Technology baseline: ${config.technologyBaseline}`,
    `Current turn: ${world.currentTurn}`,
    `Era: ${world.era}`,
    `Stability: ${world.stabilityIndex}`,
    `Conflict: ${world.conflictLevel}`,
    `Innovation: ${world.innovationLevel}`,
    `Reproduction pressure: ${world.reproductionPressure}`
  ].join("\n");
}

export function buildAgentTurnPrompt(agent: AgentProfile, state: SimulationState): string {
  const settlement = state.world.settlements.find((item) => item.id === agent.settlementId);
  const faction = state.factions.find((item) => item.id === agent.factionId);
  const household = state.households.find((item) => item.id === agent.householdId);
  const nearbyEvents = state.events.slice(0, 8).map((event) => `- ${event.title}: ${event.detail}`);

  return [
    "Return only structured JSON following the requested schema.",
    "The agent must reason from local perspective only and must not reference hidden world state or speak like a novelist.",
    buildUniversalPrompt(state),
    `Agent: ${agent.name}`,
    `Sex: ${agent.sex}`,
    `Life stage: ${agent.lifeStage}`,
    `Health: ${agent.health}/10`,
    `Fertility status: ${agent.fertilityStatus}`,
    `Current role: ${agent.currentRole}`,
    `Aspiration: ${agent.longTermAspiration}`,
    `Life philosophy: ${agent.lifePhilosophy}`,
    `Character prompt: ${agent.characterPrompt}`,
    `Traits: ${JSON.stringify(agent.traits)}`,
    `Urges: ${JSON.stringify(agent.urges)}`,
    `Needs: ${agent.needs.join(", ")}`,
    `Beliefs: ${agent.beliefs.join(" | ")}`,
    `Memory summary: ${agent.memorySummary}`,
    `Household: ${household ? household.name : "none"}`,
    `Faction: ${faction ? faction.name : "independent"}`,
    `Settlement: ${settlement ? settlement.name : "unknown"}`,
    `Recent local events:\n${nearbyEvents.length ? nearbyEvents.join("\n") : "- none"}`,
    "Required JSON keys: private_thought, dominant_urge, dominant_emotion, primary_goal, life_direction_choice, action, target, speech, belief_update, expected_reward, confidence."
  ].join("\n");
}
