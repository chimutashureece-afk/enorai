import { MiddlewareDashboard } from "@/components/middleware-dashboard";

export default async function DeveloperPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="dev-shell">
      <section className="dev-card">
        <div className="dev-header">
          <div>
            <p className="dev-eyebrow">Developer View</p>
            <h1>Middleware Activity</h1>
          </div>
          <p className="dev-subtle">Live visibility into the Python middleware handoff, trust score, latency, and fallback state.</p>
        </div>
        <MiddlewareDashboard token={params.token} />
      </section>
    </main>
  );
}
