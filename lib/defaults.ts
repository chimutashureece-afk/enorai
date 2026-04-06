import {
  AgentProfile,
  DriveMap,
  Faction,
  Household,
  InstitutionRecord,
  Region,
  ResourceBundle,
  Settlement,
  SimulationState,
  SocialTie,
  TradeLink,
  TraitMap,
  WorldConfig
} from "@/lib/types";

const resources = (food: number, tools: number, knowledge: number, influence: number, wealth: number, arms: number): ResourceBundle => ({ food, tools, knowledge, influence, wealth, arms });
const traits = (v: number[]): TraitMap => ({ intelligence: v[0], discipline: v[1], ambition: v[2], aggression: v[3], empathy: v[4], greed: v[5], loyalty: v[6], curiosity: v[7], patience: v[8], fearfulness: v[9], sociability: v[10], resilience: v[11], lust: v[12], competitiveness: v[13], dominance: v[14], attachment: v[15], conscientiousness: v[16] });
const drives = (v: number[]): DriveMap => ({ survival: v[0], safety: v[1], productivity: v[2], ambition: v[3], belonging: v[4], status: v[5], mating: v[6], family: v[7], curiosity: v[8], comfort: v[9], dominance: v[10], legacy: v[11] });
const tie = (targetId: string, label: string, trust: number, tension: number, attraction: number, kinship: number, history: string): SocialTie => ({ targetId, label, trust, tension, attraction, kinship, history });

const defaultConfig: WorldConfig = {
  worldPremise: "A rebuilding frontier basin where storage, coercion, kinship, and record-keeping determine which social order survives.",
  historicalStartingConditions: "An imperial road system collapsed two generations ago. Settlements now rely on households, militia patrols, traders, and weak councils to survive.",
  scarcityLevel: 7,
  violenceLevel: 5,
  fertilityLevel: 6,
  technologyBaseline: "Late iron-age with ledger culture, masonry, primitive medicine, and low institutional density.",
  institutionalStrength: 4,
  lawStrictness: 5,
  culturalAssumptions: "Household reputation matters, inheritance is political, and visible productivity shapes legitimacy.",
  geographyAbstraction: "A river crossing, a grain plain, an upland forge corridor, and exposed migration routes.",
  universalSimulationPrompt: "Serious research-style civilization simulation. Agents act from local knowledge only, pursue competing drives, form households, seek mates, build institutions, trade, fight, adapt, and remember. Favor structured actions and persistent consequences over dramatic prose.",
  systems: { religion: true, trade: true, politics: true, migration: true, disease: true, war: true }
};

const regions: Region[] = [
  { id: "r-valley", name: "River Valley Core", terrain: "fertile crossing", riskLevel: 4, fertility: 8, tradeValue: 8, settlements: ["s-riverwatch"] },
  { id: "r-plains", name: "Amber Grain Plain", terrain: "cropland", riskLevel: 5, fertility: 9, tradeValue: 6, settlements: ["s-amber-field"] },
  { id: "r-uplands", name: "Iron Uplands", terrain: "rocky foundry hills", riskLevel: 7, fertility: 4, tradeValue: 7, settlements: ["s-iron-hollow"] }
];

const settlements: Settlement[] = [
  { id: "s-riverwatch", name: "Riverwatch", population: 134, prosperity: 57, defense: 50, foodSecurity: 59, location: "central river crossing", regionId: "r-valley", controllingFactionId: "f-council" },
  { id: "s-amber-field", name: "Amber Field", population: 96, prosperity: 45, defense: 34, foodSecurity: 67, location: "grain plain", regionId: "r-plains", controllingFactionId: "f-grain" },
  { id: "s-iron-hollow", name: "Iron Hollow", population: 78, prosperity: 47, defense: 63, foodSecurity: 40, location: "upland forge corridor", regionId: "r-uplands", controllingFactionId: "f-guard" }
];

const tradeLinks: TradeLink[] = [
  { id: "t-1", fromSettlementId: "s-amber-field", toSettlementId: "s-riverwatch", volume: 7, risk: 4, goods: ["grain", "salt"] },
  { id: "t-2", fromSettlementId: "s-iron-hollow", toSettlementId: "s-riverwatch", volume: 6, risk: 6, goods: ["tools", "arms"] },
  { id: "t-3", fromSettlementId: "s-amber-field", toSettlementId: "s-iron-hollow", volume: 4, risk: 7, goods: ["food", "ore"] }
];

const households: Household[] = [
  { id: "h-sen", name: "House Sen", memberIds: ["a-mara", "a-selin"], headId: "a-mara", settlementId: "s-riverwatch", resources: resources(7, 4, 10, 8, 7, 1), allianceNotes: "Administrative household tied to civic legitimacy." },
  { id: "h-tor", name: "House Tor", memberIds: ["a-brann", "a-kesh", "a-elin"], headId: "a-brann", settlementId: "s-iron-hollow", resources: resources(5, 5, 3, 8, 4, 8), allianceNotes: "Militia household projecting order and fear." },
  { id: "h-corin", name: "House Corin", memberIds: ["a-ives", "a-lio", "a-nadia"], headId: "a-ives", settlementId: "s-amber-field", resources: resources(8, 3, 5, 6, 10, 1), allianceNotes: "Commercial household seeking dynastic leverage." },
  { id: "h-din", name: "House Din", memberIds: ["a-yara"], headId: "a-yara", settlementId: "s-riverwatch", resources: resources(4, 2, 7, 4, 3, 1), allianceNotes: "Care-centered independent household." }
];

const institutions: InstitutionRecord[] = [
  { id: "i-council", name: "River Council Chamber", type: "council", leaderId: "a-mara", factionId: "f-council", strength: 59, purpose: "Coordinate grain and adjudication.", foundedTurn: 0 },
  { id: "i-granary", name: "Granary Compact Ledgers", type: "guild", leaderId: "a-ives", factionId: "f-grain", strength: 53, purpose: "Coordinate storage and caravan discipline.", foundedTurn: 0 },
  { id: "i-guard", name: "Stone Guard Patrol Order", type: "army", leaderId: "a-brann", factionId: "f-guard", strength: 55, purpose: "Project frontier security.", foundedTurn: 0 }
];

const factions: Faction[] = [
  { id: "f-council", name: "River Council", type: "state", ideology: "Order through records, adjudication, and managed grain.", leaderId: "a-mara", members: ["a-mara", "a-selin"], power: 58, cohesion: 62, wealth: 50, militaryStrength: 39, institutions: ["i-council"], notes: "Administrative center with thin coercive reach." },
  { id: "f-grain", name: "Granary Compact", type: "trade_bloc", ideology: "Storage and exchange should determine authority.", leaderId: "a-ives", members: ["a-ives", "a-lio", "a-nadia"], power: 52, cohesion: 57, wealth: 58, militaryStrength: 25, institutions: ["i-granary"], notes: "Commercial bloc controlling food flows." },
  { id: "f-guard", name: "Stone Guard", type: "army", ideology: "Security is the precondition of every other good.", leaderId: "a-brann", members: ["a-brann", "a-kesh", "a-elin"], power: 54, cohesion: 49, wealth: 34, militaryStrength: 69, institutions: ["i-guard"], notes: "Militia hierarchy with political ambitions." }
];

type AgentSeed = Omit<AgentProfile, "memoryEntries" | "eventHistory" | "recentDecisions">;

const agentSeeds: AgentSeed[] = [
  {
    id: "a-mara", name: "Mara Sen", sex: "female", age: 38, lifeStage: "adult", health: 8, fertilityStatus: "fertile", identity: "woman",
    backstory: "Former famine registrar who built legitimacy by preventing granary panic.",
    personalityPrompt: "Controlled, analytical, legitimacy-seeking, quietly ambitious.", lifePhilosophy: "Power that cannot organize production is temporary.",
    currentRole: "civic administrator", longTermAspiration: "Build a durable governing order.", socialRank: 84, householdId: "h-sen", factionId: "f-council", partnerId: null, offspringIds: [],
    inventory: [{ item: "sealed ledgers", quantity: 3 }], skills: ["administration", "mediation", "ration planning"],
    relationships: [tie("a-selin", "trusted deputy", 8, 1, 1, 2, "Shared archive labor."), tie("a-brann", "civil rival", 4, 6, 0, 0, "Needs his force but fears his ambition.")],
    memories: { shortTerm: ["Ration disputes threaten legitimacy."], mediumTerm: ["Militias grow bold when records weaken."], longTerm: ["The famine years proved storage prevents collapse."], relationshipMemory: ["Brann respects force more than process."], familyMemory: ["House Sen survives by competence."], factionMemory: ["Council legitimacy remains shallow outside Riverwatch."] },
    beliefs: ["Administrative order is fragile.", "Institutions must outrun personalities."], urges: drives([8, 8, 9, 8, 5, 8, 2, 5, 6, 3, 5, 8]), needs: ["preserve food order", "contain militia overreach"],
    traits: traits([9, 9, 8, 3, 6, 3, 8, 6, 8, 4, 5, 8, 2, 6, 5, 4, 9]), productiveOrientation: 9, moralFlexibility: 4, preferredLifePath: "ruler",
    initialResources: resources(4, 3, 8, 8, 5, 1), resources: resources(4, 3, 8, 8, 5, 1), privateNotes: "Keep the council above household feuds and militia leverage.", characterPrompt: "Highly disciplined and legitimacy-oriented, suspicious of charismatic shortcuts.",
    status: "alive", memorySummary: "Civilization survives through record-keeping, ration discipline, and enforceable process.", longTermLifeDirection: "State builder focused on law and continuity.", productiveContributionScore: 84, legacyScore: 67, reproductionScore: 22, influenceScore: 82, stressTraumaScore: 37, dominantGoal: "Consolidate civic rule", currentProductivityLevel: 83, emotionalState: "controlled vigilance", trustNetworkSummary: "Dense institutional trust, low kin leverage.", latestAction: "Reviewed granary ledgers", latestBeliefUpdate: "Food order remains the foundation of political order.", settlementId: "s-riverwatch"
  },
  {
    id: "a-brann", name: "Brann Tor", sex: "male", age: 35, lifeStage: "adult", health: 8, fertilityStatus: "fertile", identity: "man",
    backstory: "Frontier captain who built the most feared patrol network in the basin.",
    personalityPrompt: "Strategic, force-respecting, proud, impatient with procedural weakness.", lifePhilosophy: "Weak authority invites predation.",
    currentRole: "militia commander", longTermAspiration: "Become unavoidable in both defense and rule.", socialRank: 78, householdId: "h-tor", factionId: "f-guard", partnerId: null, offspringIds: [],
    inventory: [{ item: "arms cache", quantity: 2 }], skills: ["command", "deterrence", "patrol logistics"],
    relationships: [tie("a-kesh", "war companion", 7, 1, 0, 1, "Shared hard campaigns."), tie("a-mara", "civil rival", 4, 6, 0, 0, "Resents civilian constraints.")],
    memories: { shortTerm: ["Route pressure is rising."], mediumTerm: ["Councils hesitate until threats become visible."], longTerm: ["Raids taught him that fear can be useful."], relationshipMemory: ["Mara will use law to clip military leverage."], familyMemory: ["House Tor gains prestige through strength."], factionMemory: ["Guard members expect promotion through danger."] },
    beliefs: ["Security precedes prosperity.", "Respect follows demonstrated force."], urges: drives([8, 7, 7, 8, 5, 8, 5, 4, 5, 3, 8, 6]), needs: ["secure routes", "expand coercive autonomy"],
    traits: traits([7, 8, 8, 8, 3, 4, 6, 5, 5, 3, 7, 8, 5, 8, 8, 4, 7]), productiveOrientation: 8, moralFlexibility: 6, preferredLifePath: "warrior",
    initialResources: resources(3, 4, 2, 7, 4, 7), resources: resources(3, 4, 2, 7, 4, 7), privateNotes: "If councils fail under strain, step into the vacuum.", characterPrompt: "Commanding and willing to coerce if softness invites collapse.",
    status: "alive", memorySummary: "Deterrence is the hard skeleton of civilization.", longTermLifeDirection: "Power broker through military order.", productiveContributionScore: 79, legacyScore: 54, reproductionScore: 18, influenceScore: 77, stressTraumaScore: 49, dominantGoal: "Strengthen the Stone Guard", currentProductivityLevel: 78, emotionalState: "hard focus", trustNetworkSummary: "Strong martial trust, thin civic trust.", latestAction: "Inspected patrol stores", latestBeliefUpdate: "Political patience should not weaken readiness.", settlementId: "s-iron-hollow"
  },
  {
    id: "a-selin", name: "Selin Voss", sex: "nonbinary", age: 29, lifeStage: "young_adult", health: 7, fertilityStatus: "unknown", identity: "nonbinary",
    backstory: "Archivist turned legal recorder and procedural thinker.", personalityPrompt: "Curious, methodical, idealistic, adaptive under pressure.", lifePhilosophy: "Memory becomes power when rules make it portable.",
    currentRole: "archivist", longTermAspiration: "Build lasting law and education.", socialRank: 58, householdId: "h-sen", factionId: "f-council", partnerId: null, offspringIds: [],
    inventory: [{ item: "wax tablets", quantity: 5 }], skills: ["archives", "teaching", "dispute coding"],
    relationships: [tie("a-mara", "mentor", 9, 0, 0, 2, "Protected by Mara."), tie("a-nadia", "intellectual ally", 7, 1, 2, 0, "Shared curiosity about systems.")],
    memories: { shortTerm: ["Disputes keep repeating recognizable patterns."], mediumTerm: ["Records can soften arbitrary violence."], longTerm: ["Archives preserved after collapse become power centers."], relationshipMemory: ["Nadia turns knowledge into methods quickly."], familyMemory: ["House Sen values usefulness over blood."], factionMemory: ["Council authority expands when procedures are legible."] },
    beliefs: ["Written standards reduce arbitrary violence."], urges: drives([6, 6, 8, 6, 5, 5, 3, 4, 9, 4, 3, 7]), needs: ["codify disputes", "build archive prestige"],
    traits: traits([8, 7, 6, 2, 7, 2, 7, 9, 7, 5, 5, 6, 3, 5, 3, 5, 8]), productiveOrientation: 8, moralFlexibility: 3, preferredLifePath: "scholar",
    initialResources: resources(2, 2, 9, 5, 3, 0), resources: resources(2, 2, 9, 5, 3, 0), privateNotes: "Turn custom into portable law before strongmen monopolize force.", characterPrompt: "Methodical and idealistic, driven by the belief that knowledge must become institution.",
    status: "alive", memorySummary: "Rules and archives can stabilize ambition without erasing it.", longTermLifeDirection: "Scholar-administrator creating legal memory.", productiveContributionScore: 81, legacyScore: 51, reproductionScore: 12, influenceScore: 56, stressTraumaScore: 24, dominantGoal: "Codify local law", currentProductivityLevel: 75, emotionalState: "measured resolve", trustNetworkSummary: "Trusted by knowledge networks, peripheral in force politics.", latestAction: "Copied dispute precedents", latestBeliefUpdate: "Patterns can become law.", settlementId: "s-riverwatch"
  },
  {
    id: "a-ives", name: "Ives Corin", sex: "male", age: 43, lifeStage: "adult", health: 7, fertilityStatus: "fertile", identity: "man",
    backstory: "Warehouse broker who turned ration arbitrage into a logistics machine.", personalityPrompt: "Practical, patient, unsentimental, leverage-oriented.", lifePhilosophy: "Storage becomes sovereignty under scarcity.",
    currentRole: "logistics broker", longTermAspiration: "Dominate regional exchange and inheritance lines.", socialRank: 73, householdId: "h-corin", factionId: "f-grain", partnerId: null, offspringIds: [],
    inventory: [{ item: "warehouse seals", quantity: 4 }], skills: ["trade", "accounting", "supply discipline"],
    relationships: [tie("a-lio", "protégé", 8, 2, 0, 0, "Useful but impatient."), tie("a-mara", "negotiating partner", 6, 2, 0, 0, "Works with civic rule while profitable.")],
    memories: { shortTerm: ["Leakage in storage systems is rising."], mediumTerm: ["Control of bottlenecks creates obedience."], longTerm: ["Scarcity rewards patient accumulators."], relationshipMemory: ["Lio will defect if advancement stalls."], familyMemory: ["House Corin should become dynastic through assets."], factionMemory: ["Traders become political when others get hungry."] },
    beliefs: ["Food and transport decide which ideologies survive."], urges: drives([7, 7, 9, 8, 4, 8, 4, 5, 6, 5, 6, 8]), needs: ["expand trade security", "capture more surplus"],
    traits: traits([7, 8, 8, 4, 3, 8, 5, 6, 8, 4, 6, 7, 4, 7, 6, 5, 8]), productiveOrientation: 9, moralFlexibility: 7, preferredLifePath: "trader",
    initialResources: resources(6, 3, 4, 6, 8, 1), resources: resources(6, 3, 4, 6, 8, 1), privateNotes: "Bind households through debt and protection.", characterPrompt: "Cool-headed and leverage-oriented, interested in durable control through logistics.",
    status: "alive", memorySummary: "Trade routes and storage systems are the hidden skeleton of power.", longTermLifeDirection: "Dynastic trader-statesman through logistics.", productiveContributionScore: 86, legacyScore: 69, reproductionScore: 24, influenceScore: 74, stressTraumaScore: 29, dominantGoal: "Control regional exchange", currentProductivityLevel: 82, emotionalState: "cold calculation", trustNetworkSummary: "Strong commercial trust, low egalitarian trust.", latestAction: "Repriced grain contracts", latestBeliefUpdate: "Leverage accumulates through bottlenecks.", settlementId: "s-amber-field"
  },
  {
    id: "a-nadia", name: "Nadia Vale", sex: "female", age: 26, lifeStage: "young_adult", health: 8, fertilityStatus: "fertile", identity: "woman",
    backstory: "Caravan scribe experimenting with numeracy and forecast methods.", personalityPrompt: "Bright, socially perceptive, future-oriented, pragmatic.", lifePhilosophy: "Useful knowledge compounds when taught widely.",
    currentRole: "analyst-teacher", longTermAspiration: "Advance knowledge systems that improve planning and household resilience.", socialRank: 49, householdId: "h-corin", factionId: "f-grain", partnerId: null, offspringIds: [],
    inventory: [{ item: "tally boards", quantity: 2 }], skills: ["forecasting", "teaching", "market analysis"],
    relationships: [tie("a-selin", "scholarly ally", 7, 1, 2, 0, "Trade records and archive thought reinforce each other."), tie("a-lio", "social ally", 6, 2, 3, 0, "Useful rapport with upward-striving runner.")],
    memories: { shortTerm: ["Forecast errors carry political consequences."], mediumTerm: ["Education reduces waste and dependency."], longTerm: ["Applied knowledge matters more than prestige learning."], relationshipMemory: ["Selin understands institutions better than merchants."], familyMemory: ["House Corin uses talent instrumentally."], factionMemory: ["Trade actors adopt innovation when gains are visible."] },
    beliefs: ["Measurement reduces chaos."], urges: drives([6, 5, 8, 7, 6, 5, 5, 6, 9, 4, 3, 7]), needs: ["protect apprentices", "test planning systems"],
    traits: traits([8, 6, 7, 2, 6, 4, 5, 9, 6, 4, 8, 7, 5, 6, 3, 6, 7]), productiveOrientation: 8, moralFlexibility: 5, preferredLifePath: "inventor",
    initialResources: resources(3, 2, 7, 4, 4, 0), resources: resources(3, 2, 7, 4, 4, 0), privateNotes: "Create systems households can actually use before elites enclose them.", characterPrompt: "Experimentally minded and practical, drawn to useful innovation more than ideology.",
    status: "alive", memorySummary: "Forecasting and teaching can reshape production without spectacle.", longTermLifeDirection: "Inventor-educator linking commerce and learning.", productiveContributionScore: 77, legacyScore: 46, reproductionScore: 19, influenceScore: 50, stressTraumaScore: 20, dominantGoal: "Spread practical numeracy", currentProductivityLevel: 72, emotionalState: "engaged curiosity", trustNetworkSummary: "Bridge figure between knowledge and trade.", latestAction: "Tested a new tallying method", latestBeliefUpdate: "Better counting changes coordination itself.", settlementId: "s-riverwatch"
  },
  {
    id: "a-kesh", name: "Kesh Aru", sex: "male", age: 31, lifeStage: "adult", health: 8, fertilityStatus: "fertile", identity: "man",
    backstory: "Border scout raised across migrating camps and unstable frontier pacts.", personalityPrompt: "Alert, skeptical, adaptive, loyal to competence.", lifePhilosophy: "Misread intentions create wars faster than hunger alone.",
    currentRole: "scout", longTermAspiration: "Stabilize border movement without blind repression.", socialRank: 55, householdId: "h-tor", factionId: "f-guard", partnerId: null, offspringIds: [],
    inventory: [{ item: "route maps", quantity: 2 }], skills: ["scouting", "negotiation", "terrain reading"],
    relationships: [tie("a-brann", "commander", 7, 1, 0, 1, "Respects Brann but watches ambition."), tie("a-yara", "kin ally", 8, 0, 1, 2, "Shared camps during disease years.")],
    memories: { shortTerm: ["Migration routes are tightening."], mediumTerm: ["Harsh signaling can backfire."], longTerm: ["Borders fail when every side overreads insult."], relationshipMemory: ["Yara sees hidden damage earlier than commanders do."], familyMemory: ["House Tor can become kin through duty."], factionMemory: ["Scouts value negotiated passage more than commanders admit."] },
    beliefs: ["Signals and misperception drive conflict."], urges: drives([8, 7, 7, 6, 6, 6, 4, 5, 7, 3, 5, 6]), needs: ["manage migration pressure", "avoid premature war"],
    traits: traits([6, 7, 6, 7, 5, 3, 8, 7, 6, 5, 6, 8, 4, 6, 5, 6, 7]), productiveOrientation: 7, moralFlexibility: 6, preferredLifePath: "explorer",
    initialResources: resources(3, 3, 3, 4, 3, 5), resources: resources(3, 3, 3, 4, 3, 5), privateNotes: "Broker routes before commanders or raiders close them.", characterPrompt: "Frontier realist with a deep feel for threat and alliance signals.",
    status: "alive", memorySummary: "Borders are shaped by perception, passage, and retaliatory memory.", longTermLifeDirection: "Frontier broker balancing security and access.", productiveContributionScore: 74, legacyScore: 39, reproductionScore: 14, influenceScore: 54, stressTraumaScore: 42, dominantGoal: "Stabilize frontier routes", currentProductivityLevel: 71, emotionalState: "watchful restraint", trustNetworkSummary: "Trusted by scouts, uncertain in urban power centers.", latestAction: "Returned with route intelligence", latestBeliefUpdate: "Negotiated channels prevent stupid wars.", settlementId: "s-iron-hollow"
  },
  {
    id: "a-lio", name: "Lio Marr", sex: "male", age: 24, lifeStage: "young_adult", health: 7, fertilityStatus: "fertile", identity: "man",
    backstory: "Dock worker turned trade runner who craves rank and household autonomy.", personalityPrompt: "Ambitious, socially agile, insecure, opportunistic.", lifePhilosophy: "Visible usefulness is the quickest road upward.",
    currentRole: "merchant runner", longTermAspiration: "Found an independent household and trade route.", socialRank: 39, householdId: "h-corin", factionId: "f-grain", partnerId: null, offspringIds: [],
    inventory: [{ item: "trade chits", quantity: 4 }], skills: ["sales", "coordination", "social maneuvering"],
    relationships: [tie("a-ives", "patron", 7, 2, 0, 0, "Learns from him but resents dependence."), tie("a-nadia", "social ally", 6, 2, 4, 0, "Attracted to her intelligence and upward possibility."), tie("a-elin", "mutual flirtation", 6, 3, 5, 0, "Shared ambition and status hunger.")],
    memories: { shortTerm: ["Prestige still belongs to those with assets."], mediumTerm: ["Service without ownership leads to stagnation."], longTerm: ["Low birth should not trap a life forever."], relationshipMemory: ["Ives rewards discipline but rarely yields ownership."], familyMemory: ["He needs a household to stop being socially disposable."], factionMemory: ["Trade factions respect usefulness more than blood."] },
    beliefs: ["Status follows visible usefulness and risk management."], urges: drives([6, 5, 7, 8, 7, 8, 7, 6, 7, 5, 5, 6]), needs: ["gain contracts", "form a stable household"],
    traits: traits([6, 5, 8, 4, 4, 7, 3, 7, 4, 6, 9, 6, 7, 8, 5, 6, 5]), productiveOrientation: 7, moralFlexibility: 7, preferredLifePath: "organizer",
    initialResources: resources(3, 1, 2, 5, 4, 0), resources: resources(3, 1, 2, 5, 4, 0), privateNotes: "Secure an alliance, route, and household before patrons freeze him out.", characterPrompt: "Restless and persuasive, willing to cut corners to rise but eager to become competent.",
    status: "alive", memorySummary: "Upward mobility requires ownership, alliance, and proof of usefulness.", longTermLifeDirection: "Household founder through trade and coordination.", productiveContributionScore: 66, legacyScore: 28, reproductionScore: 16, influenceScore: 42, stressTraumaScore: 31, dominantGoal: "Win independent contracts", currentProductivityLevel: 68, emotionalState: "driven restlessness", trustNetworkSummary: "Many weak ties, few secure loyalties.", latestAction: "Negotiated dock labor rates", latestBeliefUpdate: "Prestige requires assets, not just hustle.", settlementId: "s-riverwatch"
  },
  {
    id: "a-yara", name: "Yara Din", sex: "female", age: 33, lifeStage: "adult", health: 8, fertilityStatus: "fertile", identity: "woman",
    backstory: "Field surgeon who turned care networks into strategic infrastructure.", personalityPrompt: "Empathic, resilient, stern under crisis, intolerant of wasteful vanity.", lifePhilosophy: "Neglected pain becomes political instability.",
    currentRole: "healer", longTermAspiration: "Build durable public health and household care institutions.", socialRank: 52, householdId: "h-din", factionId: null, partnerId: null, offspringIds: [],
    inventory: [{ item: "medical herbs", quantity: 6 }], skills: ["medicine", "triage", "care coordination"],
    relationships: [tie("a-kesh", "kin ally", 8, 0, 1, 2, "Mutual trust from camp survival."), tie("a-lio", "cautious interest", 5, 2, 3, 0, "Sees his hunger for status, unsure if he can mature.")],
    memories: { shortTerm: ["Burnout among workers rises before councils notice."], mediumTerm: ["Unhealed trauma produces future violence."], longTerm: ["Care capacity is strategic capacity."], relationshipMemory: ["Kesh values hidden costs of pressure."], familyMemory: ["An isolated household is one sickness away from collapse."], factionMemory: ["Every faction needs healers but underpays them."] },
    beliefs: ["Care capacity is civilization capacity."], urges: drives([8, 7, 8, 5, 7, 4, 5, 8, 6, 3, 2, 7]), needs: ["train assistants", "stock medicine", "build stable kin ties"],
    traits: traits([7, 8, 6, 3, 9, 2, 7, 7, 8, 4, 6, 9, 5, 5, 2, 8, 8]), productiveOrientation: 9, moralFlexibility: 4, preferredLifePath: "healer",
    initialResources: resources(4, 2, 6, 5, 3, 1), resources: resources(4, 2, 6, 5, 3, 1), privateNotes: "Turn care from charity into recognized infrastructure.", characterPrompt: "Compassionate but unsentimental, motivated by preserving human capacity and reducing preventable loss.",
    status: "alive", memorySummary: "Civilization weakens whenever injury and illness are treated as private burdens only.", longTermLifeDirection: "Healer-organizer building public care systems.", productiveContributionScore: 82, legacyScore: 44, reproductionScore: 21, influenceScore: 53, stressTraumaScore: 35, dominantGoal: "Expand treatment capacity", currentProductivityLevel: 74, emotionalState: "tired resolve", trustNetworkSummary: "Cross-faction respect, limited formal power.", latestAction: "Reorganized infirmary stores", latestBeliefUpdate: "Care cannot remain secondary if labor is to survive.", settlementId: "s-riverwatch"
  },
  {
    id: "a-elin", name: "Elin Rowe", sex: "female", age: 22, lifeStage: "young_adult", health: 7, fertilityStatus: "fertile", identity: "woman",
    backstory: "Courier and rumor-carrier drawn to symbols, affiliation, and rising movements.", personalityPrompt: "Observant, socially porous, ambitious, sensitive to status currents.", lifePhilosophy: "Narrative changes who obeys whom.",
    currentRole: "courier", longTermAspiration: "Turn cultural visibility into influence and patronage.", socialRank: 33, householdId: "h-tor", factionId: "f-guard", partnerId: null, offspringIds: [],
    inventory: [{ item: "signal ribbons", quantity: 3 }], skills: ["messaging", "observation", "performance"],
    relationships: [tie("a-brann", "commander patron", 6, 2, 1, 0, "Needs his access but fears instrumental use."), tie("a-lio", "mutual flirtation", 6, 3, 5, 0, "Shared ambition and mobility hunger.")],
    memories: { shortTerm: ["Groups obey symbols before arguments."], mediumTerm: ["Patronage can become captivity."], longTerm: ["Stories often decide whether authority seems inevitable."], relationshipMemory: ["Lio is hungry enough to take risks with her."], familyMemory: ["House Tor offers protection but not belonging."], factionMemory: ["Militia cohesion rises when fear gets a story."] },
    beliefs: ["Stories can move loyalties faster than orders."], urges: drives([5, 5, 6, 7, 8, 8, 8, 5, 7, 6, 5, 6]), needs: ["find sponsorship", "convert visibility into rank"],
    traits: traits([6, 5, 7, 4, 7, 5, 5, 8, 5, 6, 9, 6, 8, 7, 5, 7, 5]), productiveOrientation: 6, moralFlexibility: 6, preferredLifePath: "artist",
    initialResources: resources(2, 1, 4, 5, 2, 1), resources: resources(2, 1, 4, 5, 2, 1), privateNotes: "Choose patrons carefully or become disposable propaganda.", characterPrompt: "Capable of becoming artist, propagandist, or broker depending on incentives.",
    status: "alive", memorySummary: "Meaning and affiliation can reshape power faster than raw force alone.", longTermLifeDirection: "Cultural broker seeking patronage and leverage.", productiveContributionScore: 58, legacyScore: 26, reproductionScore: 17, influenceScore: 38, stressTraumaScore: 27, dominantGoal: "Convert visibility into influence", currentProductivityLevel: 57, emotionalState: "alert ambition", trustNetworkSummary: "Many soft ties, low institutional security.", latestAction: "Carried messages between camps", latestBeliefUpdate: "Narrative shapes cohesion.", settlementId: "s-iron-hollow"
  }
];

const agents: AgentProfile[] = agentSeeds.map((agent) => ({ ...agent, memoryEntries: [], eventHistory: [], recentDecisions: [] }));

export function createDefaultSimulationState(): SimulationState {
  return {
    version: 2,
    config: defaultConfig,
    world: {
      currentTurn: 0,
      era: "Frontier Reconstruction",
      population: settlements.reduce((sum, settlement) => sum + settlement.population, 0),
      technologyLevel: 32,
      stabilityIndex: 53,
      inequalityIndex: 48,
      conflictLevel: 41,
      innovationLevel: 29,
      lawInstitutionMaturity: 33,
      reproductionPressure: 55,
      resourcePools: resources(44, 29, 40, 35, 38, 25),
      activeCrises: [{ id: "c-grain", title: "Storage Leakage", severity: 5, summary: "Granary losses are sharpening class friction and household anxiety." }],
      activeWars: [],
      majorDiscoveries: ["Improved tally boards", "Repaired river mill gearing"],
      recentWorldEvents: ["Leading households are debating standardized grain weights and inheritance claims."],
      majorFactions: factions.map((faction) => faction.name),
      culturalNorms: ["Household reputation matters.", "Visible productivity confers legitimacy.", "Inheritance disputes reshape alliances."],
      regions,
      settlements,
      tradeLinks,
      conflictZones: [{ id: "z-edge", regionId: "r-uplands", severity: 5, factions: ["Stone Guard", "migrant caravans"], summary: "Border passage tensions are rising around patrol enforcement." }]
    },
    agents,
    households,
    factions,
    institutions,
    events: [],
    decisionLogs: [],
    timeline: [{ turn: 0, stability: 53, conflict: 41, innovation: 29, productivity: 76, inequality: 48, reproduction: 18 }],
    innovationTimeline: ["Turn 0: Nadia Vale formalizes a more reliable household tally method."],
    factionHistory: ["Turn 0: River Council, Granary Compact, and Stone Guard begin in tense balance."],
    warLog: [],
    householdLog: ["Turn 0: Four households anchor the basin's early political economy."],
    leadershipChanges: [],
    explanations: [{ turn: 0, whyMajorEventsHappened: ["Scarcity, logistics, and defense remain the main channels through which status becomes legitimate power."], tensionsIncreased: ["Militia and council interests diverge on who should govern route security and coercion."], institutionsShifted: ["Ledger culture and household strategy are becoming more politically consequential."] }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
