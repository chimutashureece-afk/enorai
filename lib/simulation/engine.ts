import { generateGeminiDecision } from "@/lib/simulation/gemini";
import { decisionSchema } from "@/lib/simulation/schema";
import {
  AgentDecision,
  AgentProfile,
  EventRecord,
  RewardVector,
  SimulationExplanation,
  SimulationState,
  TimelinePoint,
  WarRecord
} from "@/lib/types";

const urgeActionMap: Record<string, AgentDecision["action"]> = {
  survival: "gather",
  safety: "defend",
  productivity: "work",
  ambition: "lead",
  belonging: "pair_bond",
  status: "govern",
  mating: "court",
  family: "raise_child",
  curiosity: "study",
  comfort: "rest",
  dominance: "threaten",
  legacy: "teach"
};

const lifePathActionMap: Record<string, AgentDecision["action"]> = {
  farmer: "gather",
  builder: "build",
  trader: "trade",
  warrior: "attack",
  ruler: "govern",
  scholar: "study",
  inventor: "invent",
  priest: "preach",
  healer: "work",
  organizer: "organize_group",
  artist: "teach",
  criminal: "steal",
  diplomat: "negotiate",
  explorer: "explore",
  laborer: "work",
  parent: "raise_child"
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const reward = (survival = 0, productivity = 0, status = 0, reproduction = 0, legacy = 0): RewardVector => ({ survival, productivity, status, reproduction, legacy });

function topUrge(agent: AgentProfile) {
  return Object.entries(agent.urges).sort((a, b) => b[1] - a[1])[0]?.[0] as keyof AgentProfile["urges"];
}

function inferLifePath(agent: AgentProfile): AgentProfile["preferredLifePath"] {
  if (agent.urges.family > 7 && agent.traits.attachment > 6) return "parent";
  if (agent.urges.status > 7 && agent.traits.dominance > 6) return "ruler";
  if (agent.urges.curiosity > 7 && agent.traits.intelligence > 7) return "inventor";
  if (agent.urges.productivity > 8 && agent.traits.conscientiousness > 7) return "builder";
  if (agent.urges.mating > 7 && agent.traits.sociability > 7) return "organizer";
  return agent.preferredLifePath;
}

function heuristicDecision(agent: AgentProfile, state: SimulationState): AgentDecision {
  const dominantUrge = topUrge(agent);
  const chosenPath = inferLifePath(agent);
  let action = urgeActionMap[dominantUrge] ?? lifePathActionMap[chosenPath] ?? "work";

  if (state.world.conflictLevel > 65 && agent.traits.aggression + agent.urges.dominance > 13) action = "attack";
  if (agent.health < 4 || agent.stressTraumaScore > 75) action = "rest";
  if (agent.urges.mating > 7 && !agent.partnerId) action = agent.relationships.some((r) => r.attraction > 5) ? "court" : "mate_seek";
  if (agent.partnerId && agent.urges.family > 7 && agent.fertilityStatus === "fertile") action = "reproduce_attempt";

  const bestTie = agent.relationships.slice().sort((a, b) => (b.attraction + b.trust) - (a.attraction + a.trust))[0];
  const target =
    action === "court" || action === "pair_bond" || action === "protect_family"
      ? bestTie?.targetId ?? null
      : action === "reproduce_attempt"
        ? agent.partnerId
        : action === "attack" || action === "threaten"
          ? agent.relationships.slice().sort((a, b) => b.tension - a.tension)[0]?.targetId ?? state.factions.find((f) => f.id !== agent.factionId)?.id ?? null
          : action === "trade" || action === "negotiate"
            ? agent.factionId
            : action === "raise_child"
              ? agent.offspringIds[0] ?? null
              : agent.settlementId;

  const expectedReward =
    action === "work" || action === "build" || action === "gather"
      ? reward(1, 4, 1, 0, 1)
      : action === "trade" || action === "govern" || action === "lead"
        ? reward(1, 2, 4, 0, 3)
        : action === "court" || action === "pair_bond" || action === "reproduce_attempt" || action === "raise_child"
          ? reward(1, 0, 1, 4, 3)
          : action === "study" || action === "invent" || action === "teach"
            ? reward(1, 3, 1, 0, 4)
            : action === "attack" || action === "threaten"
              ? reward(0, 0, 3, 0, 1)
              : reward(2, 1, 0, 0, 0);

  return decisionSchema.parse({
    private_thought: `${agent.name} weighs pressure from ${dominantUrge}, recent memory, and local opportunity.`,
    dominant_urge: dominantUrge,
    dominant_emotion: agent.emotionalState,
    primary_goal: agent.dominantGoal,
    life_direction_choice: chosenPath,
    action,
    target,
    speech: action === "court" ? "We would be stronger if our futures aligned." : action === "attack" ? "Weakness invites seizure." : null,
    belief_update: action === "rest" ? "Exhaustion reduces judgment." : `Local conditions suggest ${action} is the clearest next step.`,
    expected_reward: expectedReward,
    confidence: Math.max(0, Math.min(1, (agent.traits.discipline + agent.traits.intelligence + agent.urges.productivity) / 30))
  });
}

async function getDecision(agent: AgentProfile, state: SimulationState) {
  return (await generateGeminiDecision(agent, state)) ?? heuristicDecision(agent, state);
}

function pushEvent(state: SimulationState, event: Omit<EventRecord, "id">) {
  state.events.unshift({ id: `evt-${event.turn}-${state.events.length + 1}`, ...event });
  state.events = state.events.slice(0, 300);
}

function findAgent(state: SimulationState, id: string | null) {
  return id ? state.agents.find((agent) => agent.id === id) ?? null : null;
}

function changeRelationship(agent: AgentProfile, targetId: string | null, trustDelta: number, tensionDelta: number, attractionDelta = 0) {
  if (!targetId) return;
  agent.relationships = agent.relationships.map((rel) =>
    rel.targetId === targetId
      ? { ...rel, trust: clamp(rel.trust + trustDelta, 0, 10), tension: clamp(rel.tension + tensionDelta, 0, 10), attraction: clamp(rel.attraction + attractionDelta, 0, 10) }
      : rel
  );
}

function realizeAction(state: SimulationState, agent: AgentProfile, decision: AgentDecision, turn: number): { outcome: string; realizedReward: RewardVector } {
  switch (decision.action) {
    case "work":
    case "gather":
    case "build":
    case "repair":
      state.world.resourcePools.food = clamp(state.world.resourcePools.food + 1);
      state.world.resourcePools.tools = clamp(state.world.resourcePools.tools + (decision.action === "build" ? 2 : 1));
      agent.productiveContributionScore = clamp(agent.productiveContributionScore + 2);
      agent.currentProductivityLevel = clamp(agent.currentProductivityLevel + 2);
      return { outcome: `${agent.name} increases material output through ${decision.action}.`, realizedReward: reward(1, 4, 1, 0, 1) };
    case "study":
    case "teach":
    case "invent":
      state.world.resourcePools.knowledge = clamp(state.world.resourcePools.knowledge + 2);
      state.world.innovationLevel = clamp(state.world.innovationLevel + 2);
      agent.legacyScore = clamp(agent.legacyScore + 2);
      return { outcome: `${agent.name} deepens shared knowledge through ${decision.action}.`, realizedReward: reward(1, 3, 1, 0, 4) };
    case "trade":
    case "negotiate":
      state.world.resourcePools.wealth = clamp(state.world.resourcePools.wealth + 2);
      state.world.stabilityIndex = clamp(state.world.stabilityIndex + 1);
      agent.influenceScore = clamp(agent.influenceScore + 1);
      return { outcome: `${agent.name} extends exchange and bargaining capacity.`, realizedReward: reward(1, 2, 3, 0, 2) };
    case "govern":
    case "lead":
    case "organize_group":
    case "recruit":
    case "enforce_rule":
      state.world.lawInstitutionMaturity = clamp(state.world.lawInstitutionMaturity + 2);
      state.world.stabilityIndex = clamp(state.world.stabilityIndex + 1);
      agent.socialRank = clamp(agent.socialRank + 2);
      agent.influenceScore = clamp(agent.influenceScore + 2);
      return { outcome: `${agent.name} consolidates institutional or factional coordination.`, realizedReward: reward(1, 2, 4, 0, 3) };
    case "court":
    case "flirt":
    case "pair_bond": {
      const target = findAgent(state, decision.target);
      if (target) {
        changeRelationship(agent, target.id, 1, -1, 1);
        changeRelationship(target, agent.id, 1, -1, 1);
        if (decision.action === "pair_bond" || agent.relationships.find((r) => r.targetId === target.id)?.attraction === 10) {
          agent.partnerId = target.id;
          target.partnerId = agent.id;
          pushEvent(state, { turn, category: "family", title: `${agent.name} and ${target.name} form a bond`, detail: "A new household alliance begins to matter politically and materially.", impact: 5 });
        }
      }
      return { outcome: `${agent.name} invests in mating and alliance formation.`, realizedReward: reward(1, 0, 1, 2, 2) };
    }
    case "reproduce_attempt": {
      const target = findAgent(state, agent.partnerId);
      const successScore = state.config.fertilityLevel + agent.urges.family + (target?.urges.family ?? 0);
      if (target && successScore > 16) {
        agent.reproductionScore = clamp(agent.reproductionScore + 4);
        target.reproductionScore = clamp(target.reproductionScore + 4);
        agent.legacyScore = clamp(agent.legacyScore + 2);
        target.legacyScore = clamp(target.legacyScore + 2);
        state.world.reproductionPressure = clamp(state.world.reproductionPressure + 1);
        pushEvent(state, { turn, category: "reproduction", title: `${agent.name} and ${target.name} pursue reproduction`, detail: "A household allocates time and resources toward offspring and inheritance continuity.", impact: 6 });
        return { outcome: `${agent.name} commits household resources to reproduction with ${target.name}.`, realizedReward: reward(1, -1, 1, 4, 3) };
      }
      return { outcome: `${agent.name}'s reproduction attempt fails to stabilize into offspring this turn.`, realizedReward: reward(0, -1, 0, 1, 1) };
    }
    case "raise_child":
    case "protect_family":
      agent.legacyScore = clamp(agent.legacyScore + 1);
      state.world.stabilityIndex = clamp(state.world.stabilityIndex + 1);
      return { outcome: `${agent.name} invests in household defense or child-rearing.`, realizedReward: reward(2, 0, 1, 2, 3) };
    case "attack":
    case "threaten":
    case "punish":
      state.world.conflictLevel = clamp(state.world.conflictLevel + 3);
      state.world.stabilityIndex = clamp(state.world.stabilityIndex - 2);
      agent.influenceScore = clamp(agent.influenceScore + 1);
      agent.stressTraumaScore = clamp(agent.stressTraumaScore + 2);
      changeRelationship(agent, decision.target, -1, 2);
      return { outcome: `${agent.name} escalates coercive conflict.`, realizedReward: reward(0, 0, 3, 0, 1) };
    case "steal":
    case "deceive":
      state.world.inequalityIndex = clamp(state.world.inequalityIndex + 2);
      state.world.conflictLevel = clamp(state.world.conflictLevel + 1);
      return { outcome: `${agent.name} pursues covert extraction at the expense of trust.`, realizedReward: reward(0, 1, 1, 0, 0) };
    case "explore":
    case "migrate":
      state.world.technologyLevel = clamp(state.world.technologyLevel + 1);
      state.world.resourcePools.knowledge = clamp(state.world.resourcePools.knowledge + 1);
      return { outcome: `${agent.name} pursues movement and local discovery.`, realizedReward: reward(1, 1, 0, 0, 1) };
    case "preach":
      state.world.stabilityIndex = clamp(state.world.stabilityIndex + 1);
      return { outcome: `${agent.name} strengthens identity and shared belief.`, realizedReward: reward(1, 0, 2, 0, 2) };
    case "rest":
    case "obey":
    default:
      agent.health = clamp(agent.health + 1, 0, 10);
      agent.stressTraumaScore = clamp(agent.stressTraumaScore - 2);
      return { outcome: `${agent.name} conserves energy and reduces immediate strain.`, realizedReward: reward(2, 0, 0, 0, 0) };
  }
}

function maybeFormFaction(state: SimulationState, agent: AgentProfile, turn: number) {
  if (agent.influenceScore < 70 || state.factions.length > 5) return;
  if (state.factions.some((f) => f.leaderId === agent.id)) return;
  const factionId = `f-${agent.id}`;
  state.factions.push({
    id: factionId,
    name: `${agent.name.split(" ")[0]}'s Circle`,
    type: "rebel",
    ideology: `A personal network built around ${agent.name}'s rising influence.`,
    leaderId: agent.id,
    members: [agent.id],
    power: 35,
    cohesion: 45,
    wealth: 25,
    militaryStrength: 25,
    institutions: [],
    notes: "Emergent personal faction."
  });
  agent.factionId = factionId;
  state.factionHistory.unshift(`Turn ${turn}: ${agent.name} forms a personal faction to convert influence into durable organization.`);
}

function maybeWar(state: SimulationState, turn: number) {
  if (!state.config.systems.war || state.world.conflictLevel < 70 || state.world.activeWars.some((war) => war.active)) return;
  const strongest = state.factions.slice().sort((a, b) => b.militaryStrength - a.militaryStrength).slice(0, 2);
  if (strongest.length < 2) return;
  const war: WarRecord = {
    id: `war-${turn}`,
    name: `Basin War ${turn}`,
    factions: strongest.map((item) => item.name),
    cause: "Escalating rivalry over grain, coercion, and institutional legitimacy.",
    startedTurn: turn,
    active: true,
    intensity: state.world.conflictLevel,
    casualties: 0,
    latestDevelopment: "Organized hostilities begin around resource corridors."
  };
  state.world.activeWars.push(war);
  state.warLog.unshift(`Turn ${turn}: ${war.name} begins between ${war.factions.join(" and ")}.`);
  pushEvent(state, { turn, category: "conflict", title: `${war.name} erupts`, detail: war.latestDevelopment, impact: 9 });
}

function updateWorld(state: SimulationState, turn: number) {
  state.world.population = state.world.settlements.reduce((sum, settlement) => sum + settlement.population, 0);
  state.world.majorFactions = state.factions.slice().sort((a, b) => b.power - a.power).map((f) => f.name);
  state.world.recentWorldEvents = state.events.slice(0, 8).map((event) => `${event.title}: ${event.detail}`);
  state.world.activeCrises = [];
  if (state.world.resourcePools.food < 24) state.world.activeCrises.push({ id: "c-food", title: "Food Strain", severity: 8, summary: "Low reserves are destabilizing households and exchange." });
  if (state.world.conflictLevel > 72) state.world.activeCrises.push({ id: "c-war", title: "Escalating Rivalry", severity: 7, summary: "Factional competition is approaching organized war." });
  if (state.world.stabilityIndex < 35) state.world.activeCrises.push({ id: "c-order", title: "Institutional Weakness", severity: 6, summary: "Order is relying too heavily on personalities and force." });
  if (state.world.innovationLevel > 55 && state.world.lawInstitutionMaturity > 55) state.world.era = "Institutional Consolidation";
  else if (state.world.conflictLevel > 70 && state.world.stabilityIndex < 40) state.world.era = "Militarized Fragmentation";
  else if (turn > 30) state.world.era = "Competitive Growth";
}

export async function runSimulationTurns(state: SimulationState, count: number): Promise<SimulationState> {
  for (let i = 0; i < count; i += 1) {
    const turn = state.world.currentTurn + 1;
    const drivers: string[] = [];
    const tensions: string[] = [];
    const institutions: string[] = [];

    for (const agent of state.agents) {
      if (agent.status !== "alive") continue;
      const decision = await getDecision(agent, state);
      const { outcome, realizedReward } = realizeAction(state, agent, decision, turn);

      agent.preferredLifePath = decision.life_direction_choice ?? agent.preferredLifePath;
      agent.longTermLifeDirection = `${agent.preferredLifePath} trajectory shaped by ${decision.dominant_urge} pressure.`;
      agent.dominantGoal = decision.primary_goal;
      agent.emotionalState = decision.dominant_emotion;
      agent.latestAction = `${decision.action}${decision.target ? ` -> ${decision.target}` : ""}`;
      agent.latestBeliefUpdate = decision.belief_update;
      agent.beliefs = [decision.belief_update, ...agent.beliefs].slice(0, 6);
      agent.memorySummary = `${agent.memorySummary} Turn ${turn}: ${outcome}`.slice(0, 500);
      agent.memories.shortTerm = [outcome, ...agent.memories.shortTerm].slice(0, 5);
      agent.memories.mediumTerm = [decision.primary_goal, ...agent.memories.mediumTerm].slice(0, 5);
      agent.memoryEntries = [{ turn, summary: outcome, weight: Math.max(1, Math.round(realizedReward.legacy + realizedReward.reproduction + realizedReward.status)) }, ...agent.memoryEntries].slice(0, 12);
      agent.recentDecisions = [decision, ...agent.recentDecisions].slice(0, 6);
      agent.eventHistory = [outcome, ...agent.eventHistory].slice(0, 10);
      agent.urges.productivity = clamp(agent.urges.productivity + realizedReward.productivity - 1, 0, 10);
      agent.urges.status = clamp(agent.urges.status + (realizedReward.status > 0 ? 0 : 1), 0, 10);
      agent.urges.family = clamp(agent.urges.family + (agent.partnerId ? 1 : 0), 0, 10);
      agent.urges.mating = clamp(agent.partnerId ? agent.urges.mating - 1 : agent.urges.mating + 1, 0, 10);
      agent.stressTraumaScore = clamp(agent.stressTraumaScore + (decision.action === "attack" ? 3 : decision.action === "rest" ? -2 : 0));
      agent.trustNetworkSummary = `${agent.relationships.filter((item) => item.trust >= 6).length} strong ties, ${agent.relationships.filter((item) => item.attraction >= 6).length} mating ties, ${agent.relationships.filter((item) => item.tension >= 6).length} hostile ties.`;
      if (decision.action === "court" || decision.action === "pair_bond" || decision.action === "reproduce_attempt") drivers.push(`${agent.name} redirected effort toward household formation and legacy.`);
      if (decision.action === "attack" || decision.action === "threaten") tensions.push(`${agent.name} increased coercive pressure.`);
      if (decision.action === "govern" || decision.action === "lead" || decision.action === "enforce_rule") institutions.push(`${agent.name} strengthened formal coordination.`);
      maybeFormFaction(state, agent, turn);

      state.decisionLogs.unshift({ turn, agentId: agent.id, agentName: agent.name, decision, outcome, realizedReward });
      state.decisionLogs = state.decisionLogs.slice(0, 400);
      pushEvent(state, {
        turn,
        category:
          decision.action === "trade" || decision.action === "negotiate" ? "trade" :
          decision.action === "court" || decision.action === "pair_bond" || decision.action === "reproduce_attempt" || decision.action === "raise_child" ? "family" :
          decision.action === "attack" || decision.action === "threaten" || decision.action === "punish" ? "conflict" :
          decision.action === "study" || decision.action === "invent" || decision.action === "teach" ? "innovation" :
          decision.action === "govern" || decision.action === "lead" || decision.action === "enforce_rule" ? "institution" :
          "production",
        title: `${agent.name}: ${decision.primary_goal}`,
        detail: outcome,
        impact: Math.round(decision.confidence * 10)
      });
    }

    state.world.currentTurn = turn;
    maybeWar(state, turn);
    for (const war of state.world.activeWars) {
      if (!war.active) continue;
      war.intensity = clamp(war.intensity + (state.world.conflictLevel > 75 ? 2 : -1));
      war.casualties += war.intensity > 75 ? 3 : 1;
      war.latestDevelopment = war.intensity > 75 ? "Open clashes damage hierarchy, reserves, and morale." : "Localized violence persists around contested routes.";
      if (war.intensity < 45) {
        war.active = false;
        state.warLog.unshift(`Turn ${turn}: ${war.name} settles into an exhausted ceasefire after ${war.casualties} estimated casualties.`);
      }
    }
    updateWorld(state, turn);

    const productivity = Math.round(state.agents.reduce((sum, agent) => sum + agent.productiveContributionScore, 0) / state.agents.length);
    const reproduction = Math.round(state.agents.reduce((sum, agent) => sum + agent.reproductionScore, 0) / state.agents.length);
    state.timeline.push({ turn, stability: state.world.stabilityIndex, conflict: state.world.conflictLevel, innovation: state.world.innovationLevel, productivity, inequality: state.world.inequalityIndex, reproduction });
    state.timeline = state.timeline.slice(-150);
    state.explanations.unshift({
      turn,
      whyMajorEventsHappened: Array.from(new Set(drivers)).slice(0, 5),
      tensionsIncreased: Array.from(new Set(tensions)).slice(0, 5),
      institutionsShifted: Array.from(new Set(institutions)).slice(0, 5)
    });
    state.explanations = state.explanations.slice(0, 100);
  }

  return state;
}
