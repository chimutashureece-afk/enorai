import { promises as fs } from "fs";
import path from "path";
import { createDefaultSimulationState } from "@/lib/defaults";
import { SimulationState } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const statePath = path.join(dataDir, "simulation-state.json");
const snapshotDir = path.join(dataDir, "snapshots");

async function ensureStorage() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(snapshotDir, { recursive: true });
}

export async function loadSimulationState(): Promise<SimulationState> {
  await ensureStorage();

  try {
    const raw = await fs.readFile(statePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<SimulationState>;
    if (parsed.version !== 2 || !parsed.world || !("households" in parsed)) {
      const initial = createDefaultSimulationState();
      await saveSimulationState(initial);
      return initial;
    }
    return parsed as SimulationState;
  } catch {
    const initial = createDefaultSimulationState();
    await saveSimulationState(initial);
    return initial;
  }
}

export async function saveSimulationState(state: SimulationState): Promise<void> {
  await ensureStorage();
  const nextState = { ...state, updatedAt: new Date().toISOString() };
  await fs.writeFile(statePath, JSON.stringify(nextState, null, 2), "utf8");
}

export async function resetSimulationState(): Promise<SimulationState> {
  const state = createDefaultSimulationState();
  await saveSimulationState(state);
  return state;
}

export async function saveSnapshot(snapshotName?: string): Promise<string> {
  const state = await loadSimulationState();
  const safeName =
    snapshotName?.trim().replace(/[^a-z0-9-_]/gi, "-").toLowerCase() || `snapshot-turn-${state.world.currentTurn}`;
  const filename = `${safeName}.json`;
  await fs.writeFile(path.join(snapshotDir, filename), JSON.stringify(state, null, 2), "utf8");
  return filename;
}

export async function listSnapshots(): Promise<string[]> {
  await ensureStorage();
  const files = await fs.readdir(snapshotDir);
  return files.filter((file) => file.endsWith(".json")).sort();
}

export async function loadSnapshot(filename: string): Promise<SimulationState> {
  await ensureStorage();
  const raw = await fs.readFile(path.join(snapshotDir, filename), "utf8");
  const state = JSON.parse(raw) as SimulationState;
  await saveSimulationState(state);
  return state;
}
