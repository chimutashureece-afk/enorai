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

declare global {
  // eslint-disable-next-line no-var
  var __middlewareLogs: MiddlewareLogEntry[] | undefined;
}

function getMemoryLogs() {
  if (!globalThis.__middlewareLogs) {
    globalThis.__middlewareLogs = [];
  }

  return globalThis.__middlewareLogs;
}

function isServerlessRuntime() {
  return process.env.VERCEL === "1";
}

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
  const memoryLogs = getMemoryLogs();
  memoryLogs.unshift(entry);
  if (memoryLogs.length > MAX_LOGS) {
    memoryLogs.length = MAX_LOGS;
  }

  if (isServerlessRuntime()) {
    return;
  }

  try {
    await mkdir(logDirectory, { recursive: true });
    const currentLogs = await readLogsFile();
    const nextLogs = [entry, ...currentLogs].slice(0, MAX_LOGS);
    await writeFile(logFile, JSON.stringify(nextLogs, null, 2), "utf8");
  } catch {
    // Logging should never break the chat response path.
  }
}

export async function listMiddlewareLogs() {
  if (isServerlessRuntime()) {
    return [...getMemoryLogs()];
  }

  const diskLogs = await readLogsFile();
  return diskLogs.length ? diskLogs : [...getMemoryLogs()];
}
