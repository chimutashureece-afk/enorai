"use client";

import { useEffect, useState } from "react";

type MiddlewareLogEntry = {
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

type DashboardResponse = {
  logs: MiddlewareLogEntry[];
};

export function MiddlewareDashboard({ token }: { token?: string }) {
  const [logs, setLogs] = useState<MiddlewareLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLogs() {
      try {
        const query = token ? `?token=${encodeURIComponent(token)}` : "";
        const response = await fetch(`/api/dev/middleware-logs${query}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error(response.status === 401 ? "Unauthorized" : "Failed to load middleware logs");
        }

        const data = (await response.json()) as DashboardResponse;
        if (!cancelled) {
          setLogs(data.logs);
          setError(null);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : "Unknown error");
        }
      }
    }

    void loadLogs();
    const timer = window.setInterval(() => {
      void loadLogs();
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [token]);

  if (error) {
    return <p className="dev-empty-state">{error}</p>;
  }

  if (!logs.length) {
    return <p className="dev-empty-state">No middleware traffic yet. Send a chat message to populate this view.</p>;
  }

  return (
    <div className="dev-log-stack">
      {logs.map((log) => (
        <article key={log.id} className="dev-log-card">
          <div className="dev-log-top">
            <div>
              <span className="dev-chip">{log.requestSource}</span>
              <strong>{log.status}</strong>
            </div>
            <span className={log.riskLevel === "high" ? "dev-risk danger" : "dev-risk"}>{log.riskLevel}</span>
          </div>
          <p className="dev-message-preview">{log.latestUserMessage}</p>
          <div className="dev-meta-grid">
            <span>Trust: {typeof log.trustScore === "number" ? log.trustScore.toFixed(2) : "n/a"}</span>
            <span>Latency: {log.durationMs} ms</span>
            <span>{new Date(log.createdAt).toLocaleString()}</span>
          </div>
          <p className="dev-detail">{log.detail}</p>
        </article>
      ))}
    </div>
  );
}
