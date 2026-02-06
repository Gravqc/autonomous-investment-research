import { env } from "../app/env";

type Portfolio = {
  total_value: number;
  cash: number;
  positions: { symbol: string; shares: number }[];
};

type Decision = {
  symbol: string;
  action: string;
  confidence: number;
};

type Health = {
  status: string;
};

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${env.NEXT_PUBLIC_FASTAPI_URL}${path}`, {
    // Ensure fresh data when developing
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

async function getData() {
  const [portfolio, decisions, health] = await Promise.all([
    fetchJson<Portfolio>("/api/portfolio"),
    fetchJson<Decision[]>("/api/decisions"),
    fetchJson<Health>("/api/health"),
  ]);

  return { portfolio, decisions, health };
}

export default async function Home() {
  const { portfolio, decisions, health } = await getData();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-4xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Autonomous Investment Research
            </h1>
            <p className="text-sm text-slate-400">
              FastAPI backend at {env.NEXT_PUBLIC_API_URL} (
              <span
                className={
                  health.status === "ok" ? "text-emerald-400" : "text-red-400"
                }
              >
                health: {health.status}
              </span>
              )
            </p>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 col-span-2">
            <h2 className="text-sm font-medium text-slate-300 mb-3">
              Portfolio Snapshot
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Total value</span>
                <span className="font-mono">
                  ${portfolio.total_value.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cash</span>
                <span className="font-mono">
                  ${portfolio.cash.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                Positions
              </h3>
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 overflow-hidden text-xs">
                <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-400">
                  <span>Symbol</span>
                  <span className="text-right">Shares</span>
                  <span className="text-right">Weight</span>
                </div>
                {portfolio.positions.map((p) => (
                  <div
                    key={p.symbol}
                    className="grid grid-cols-3 px-3 py-2 border-t border-slate-900/60"
                  >
                    <span className="font-mono">{p.symbol}</span>
                    <span className="text-right">{p.shares}</span>
                    <span className="text-right text-slate-400">–</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-sm font-medium text-slate-300 mb-3">
              Model Decisions
            </h2>
            <div className="space-y-2 text-xs">
              {decisions.map((d) => (
                <div
                  key={d.symbol}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm">{d.symbol}</span>
                    <span
                      className={
                        d.action === "BUY"
                          ? "text-emerald-400 text-[11px] font-semibold"
                          : "text-red-400 text-[11px] font-semibold"
                      }
                    >
                      {d.action}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Confidence</span>
                    <span className="font-mono">
                      {(d.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
