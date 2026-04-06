export type LifeStage = "child" | "adolescent" | "young_adult" | "adult" | "elder";
export type AgentStatus = "alive" | "dead" | "missing";
export type FertilityStatus = "fertile" | "infertile" | "pregnant" | "postpartum" | "unknown";
export type LifePath =
  | "farmer"
  | "builder"
  | "trader"
  | "warrior"
  | "ruler"
  | "scholar"
  | "inventor"
  | "priest"
  | "healer"
  | "organizer"
  | "artist"
  | "criminal"
  | "diplomat"
  | "explorer"
  | "laborer"
  | "parent";

export type ActionType =
  | "work"
  | "gather"
  | "build"
  | "repair"
  | "study"
  | "teach"
  | "trade"
  | "negotiate"
  | "flirt"
  | "court"
  | "mate_seek"
  | "pair_bond"
  | "reproduce_attempt"
  | "protect_family"
  | "raise_child"
  | "recruit"
  | "organize_group"
  | "lead"
  | "obey"
  | "steal"
  | "deceive"
  | "threaten"
  | "attack"
  | "defend"
  | "migrate"
  | "rest"
  | "explore"
  | "invent"
  | "preach"
  | "govern"
  | "punish"
  | "enforce_rule";

export interface TraitMap {
  intelligence: number;
  discipline: number;
  ambition: number;
  aggression: number;
  empathy: number;
  greed: number;
  loyalty: number;
  curiosity: number;
  patience: number;
  fearfulness: number;
  sociability: number;
  resilience: number;
  lust: number;
  competitiveness: number;
  dominance: number;
  attachment: number;
  conscientiousness: number;
}

export interface DriveMap {
  survival: number;
  safety: number;
  productivity: number;
  ambition: number;
  belonging: number;
  status: number;
  mating: number;
  family: number;
  curiosity: number;
  comfort: number;
  dominance: number;
  legacy: number;
}

export interface RewardVector {
  survival: number;
  productivity: number;
  status: number;
  reproduction: number;
  legacy: number;
}

export interface ResourceBundle {
  food: number;
  tools: number;
  knowledge: number;
  influence: number;
  wealth: number;
  arms: number;
}

export interface InventoryItem {
  item: string;
  quantity: number;
}

export interface SocialTie {
  targetId: string;
  label: string;
  trust: number;
  tension: number;
  attraction: number;
  kinship: number;
  history: string;
}

export interface MemoryLayer {
  shortTerm: string[];
  mediumTerm: string[];
  longTerm: string[];
  relationshipMemory: string[];
  familyMemory: string[];
  factionMemory: string[];
}

export interface AgentMemoryEntry {
  turn: number;
  summary: string;
  weight: number;
}

export interface AgentDecision {
  private_thought: string;
  dominant_urge: keyof DriveMap;
  dominant_emotion: string;
  primary_goal: string;
  life_direction_choice: LifePath | null;
  action: ActionType;
  target: string | null;
  speech: string | null;
  belief_update: string;
  expected_reward: RewardVector;
  confidence: number;
}

export interface DecisionLogEntry {
  turn: number;
  agentId: string;
  agentName: string;
  decision: AgentDecision;
  outcome: string;
  realizedReward: RewardVector;
}

export interface EventRecord {
  id: string;
  turn: number;
  category:
    | "production"
    | "trade"
    | "conflict"
    | "institution"
    | "innovation"
    | "leadership"
    | "settlement"
    | "family"
    | "crisis"
    | "culture"
    | "reproduction";
  title: string;
  detail: string;
  impact: number;
}

export interface Household {
  id: string;
  name: string;
  memberIds: string[];
  headId: string | null;
  settlementId: string;
  resources: ResourceBundle;
  allianceNotes: string;
}

export interface Region {
  id: string;
  name: string;
  terrain: string;
  riskLevel: number;
  fertility: number;
  tradeValue: number;
  settlements: string[];
}

export interface TradeLink {
  id: string;
  fromSettlementId: string;
  toSettlementId: string;
  volume: number;
  risk: number;
  goods: string[];
}

export interface ConflictZone {
  id: string;
  regionId: string;
  severity: number;
  factions: string[];
  summary: string;
}

export interface InstitutionRecord {
  id: string;
  name: string;
  type: "clan" | "guild" | "army" | "council" | "religious" | "trade_bloc" | "state" | "rebel";
  leaderId: string | null;
  factionId: string | null;
  strength: number;
  purpose: string;
  foundedTurn: number;
}

export interface Faction {
  id: string;
  name: string;
  type: "clan" | "guild" | "army" | "council" | "religious" | "trade_bloc" | "state" | "rebel";
  ideology: string;
  leaderId: string | null;
  members: string[];
  power: number;
  cohesion: number;
  wealth: number;
  militaryStrength: number;
  institutions: string[];
  notes: string;
}

export interface Settlement {
  id: string;
  name: string;
  population: number;
  prosperity: number;
  defense: number;
  foodSecurity: number;
  location: string;
  regionId: string;
  controllingFactionId: string | null;
}

export interface WarRecord {
  id: string;
  name: string;
  factions: string[];
  cause: string;
  startedTurn: number;
  active: boolean;
  intensity: number;
  casualties: number;
  latestDevelopment: string;
}

export interface CrisisRecord {
  id: string;
  title: string;
  severity: number;
  summary: string;
}

export interface WorldConfig {
  worldPremise: string;
  historicalStartingConditions: string;
  scarcityLevel: number;
  violenceLevel: number;
  fertilityLevel: number;
  technologyBaseline: string;
  institutionalStrength: number;
  lawStrictness: number;
  culturalAssumptions: string;
  geographyAbstraction: string;
  universalSimulationPrompt: string;
  systems: {
    religion: boolean;
    trade: boolean;
    politics: boolean;
    migration: boolean;
    disease: boolean;
    war: boolean;
  };
}

export interface WorldState {
  currentTurn: number;
  era: string;
  population: number;
  technologyLevel: number;
  stabilityIndex: number;
  inequalityIndex: number;
  conflictLevel: number;
  innovationLevel: number;
  lawInstitutionMaturity: number;
  reproductionPressure: number;
  resourcePools: ResourceBundle;
  activeCrises: CrisisRecord[];
  activeWars: WarRecord[];
  majorDiscoveries: string[];
  recentWorldEvents: string[];
  majorFactions: string[];
  culturalNorms: string[];
  regions: Region[];
  settlements: Settlement[];
  tradeLinks: TradeLink[];
  conflictZones: ConflictZone[];
}

export interface AgentProfile {
  id: string;
  name: string;
  sex: string;
  age: number;
  lifeStage: LifeStage;
  health: number;
  fertilityStatus: FertilityStatus;
  identity: string;
  backstory: string;
  personalityPrompt: string;
  lifePhilosophy: string;
  currentRole: string;
  longTermAspiration: string;
  socialRank: number;
  householdId: string | null;
  factionId: string | null;
  partnerId: string | null;
  offspringIds: string[];
  inventory: InventoryItem[];
  skills: string[];
  relationships: SocialTie[];
  memories: MemoryLayer;
  beliefs: string[];
  urges: DriveMap;
  needs: string[];
  traits: TraitMap;
  productiveOrientation: number;
  moralFlexibility: number;
  preferredLifePath: LifePath;
  initialResources: ResourceBundle;
  resources: ResourceBundle;
  privateNotes: string;
  characterPrompt: string;
  status: AgentStatus;
  memorySummary: string;
  memoryEntries: AgentMemoryEntry[];
  longTermLifeDirection: string;
  productiveContributionScore: number;
  legacyScore: number;
  reproductionScore: number;
  influenceScore: number;
  stressTraumaScore: number;
  dominantGoal: string;
  currentProductivityLevel: number;
  emotionalState: string;
  trustNetworkSummary: string;
  latestAction: string;
  latestBeliefUpdate: string;
  eventHistory: string[];
  recentDecisions: AgentDecision[];
  settlementId: string | null;
}

export interface TimelinePoint {
  turn: number;
  stability: number;
  conflict: number;
  innovation: number;
  productivity: number;
  inequality: number;
  reproduction: number;
}

export interface LeadershipRecord {
  turn: number;
  factionName: string;
  leaderName: string;
  reason: string;
}

export interface SimulationExplanation {
  turn: number;
  whyMajorEventsHappened: string[];
  tensionsIncreased: string[];
  institutionsShifted: string[];
}

export interface SimulationState {
  version: number;
  config: WorldConfig;
  world: WorldState;
  agents: AgentProfile[];
  households: Household[];
  factions: Faction[];
  institutions: InstitutionRecord[];
  events: EventRecord[];
  decisionLogs: DecisionLogEntry[];
  timeline: TimelinePoint[];
  innovationTimeline: string[];
  factionHistory: string[];
  warLog: string[];
  householdLog: string[];
  leadershipChanges: LeadershipRecord[];
  explanations: SimulationExplanation[];
  createdAt: string;
  updatedAt: string;
}
