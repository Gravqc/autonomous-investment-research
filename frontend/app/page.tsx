import { getDashboardData } from "../lib/api";
import PortfolioValueChart from "../components/PortfolioValueChart";
import PerformanceMetrics from "../components/PerformanceMetrics";
import DecisionCard from "../components/DecisionCard";
import Link from "next/link";

export default async function Home() {
  try {
    const { portfolioState, valueHistory, performance, recentDecisions, health } = await getDashboardData();

    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-6xl space-y-8">
          {/* Header */}
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">
                Autonomous Investment Research
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                AI-powered paper trading system • Backend status: 
                <span className={health.status === "ok" ? "text-emerald-400 ml-1" : "text-red-400 ml-1"}>
                  {health.status}
                </span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono text-slate-50">
                ₹{portfolioState.current_value.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">
                Portfolio Value
              </div>
            </div>
          </header>

          {/* Performance Overview */}
          <section>
            <h2 className="text-lg font-medium text-slate-300 mb-4">Performance Overview</h2>
            <PerformanceMetrics metrics={performance} />
          </section>

          {/* Main Dashboard Grid */}
          <section className="grid gap-6 lg:grid-cols-3">
            {/* Portfolio Chart */}
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <PortfolioValueChart 
                snapshots={valueHistory.snapshots}
                className="w-full"
              />
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-slate-400">Cash</div>
                  <div className="font-mono">₹{portfolioState.cash_balance.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400">Equity</div>
                  <div className="font-mono">₹{portfolioState.equity_value.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400">Positions</div>
                  <div className="font-mono">{portfolioState.positions.length}</div>
                </div>
              </div>
            </div>

            {/* Current Positions */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-300">Current Positions</h3>
                <Link 
                  href="/portfolio" 
                  className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                >
                  View all →
                </Link>
              </div>
              
              {portfolioState.positions.length > 0 ? (
                <div className="space-y-3">
                  {portfolioState.positions.slice(0, 5).map((position) => (
                    <div key={position.symbol} className="flex items-center justify-between">
                      <div>
                        <div className="font-mono text-sm">{position.symbol}</div>
                        <div className="text-xs text-slate-400">
                          {position.quantity} shares @ ₹{position.avg_price}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono">
                          ₹{(position.quantity * position.avg_price).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {portfolioState.positions.length > 5 && (
                    <div className="text-xs text-slate-400 text-center pt-2">
                      +{portfolioState.positions.length - 5} more positions
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  No positions yet
                </div>
              )}
            </div>
          </section>

          {/* Recent AI Decisions */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-slate-300">Recent AI Decisions</h2>
              <Link 
                href="/decisions" 
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                View all decisions →
              </Link>
            </div>
            
            {recentDecisions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentDecisions.map((decision) => (
                  <div key={decision.decision_id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">#{decision.decision_id}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(decision.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-300 mb-2">
                      {decision.action_summary}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Confidence:</span>
                      <span className="text-xs font-mono text-emerald-400">
                        {(decision.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8 rounded-lg border border-slate-800 bg-slate-950/60">
                No decisions yet
              </div>
            )}
          </section>

          {/* Navigation */}
          <section className="flex justify-center gap-4 pt-8">
            <Link 
              href="/decisions" 
              className="px-6 py-3 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Explore AI Decisions
            </Link>
            <Link 
              href="/portfolio" 
              className="px-6 py-3 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Portfolio Details
            </Link>
          </section>
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Unable to Load Dashboard</h1>
          <p className="text-slate-400 mb-4">
            Error: {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <p className="text-sm text-slate-500">
            Make sure the backend server is running and accessible.
          </p>
        </div>
      </main>
    );
  }
}
