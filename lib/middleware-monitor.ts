import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type MiddlewareLogEntry = {
  id: string;
  createdAt: string;
  requestSource: "middleware-engine" | "fallback";
  latestUserMessage: string;
  trustScore?: number;
  riskLevel: "low" | "high";
  durationMs: number;
  status: "success" | "fallback" | "error";
  detail: string;
};

const MAX_LOGS = 100;
const logDirectory = path.join(process.cwd(), "data");
const logFile = path.join(logDirectory, "middleware-logs.json");

async function readLogsFile() {
  try {
    const raw = await readFile(logFile, "utf8");
    const parsed = JSON.parse(raw) as MiddlewareLogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function recordMiddlewareLog(entry: MiddlewareLogEntry) {
  await mkdir(logDirectory, { recursive: true });
  const currentLogs = await readLogsFile();
  const nextLogs = [entry, ...currentLogs].slice(0, MAX_LOGS);
  await writeFile(logFile, JSON.stringify(nextLogs, null, 2), "utf8");
}

export async function listMiddlewareLogs() {
  return readLogsFile();
}
