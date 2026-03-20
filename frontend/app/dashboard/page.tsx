import { Suspense } from "react";
import { getDashboardData } from "../../lib/api";
import PortfolioValueChart from "../../components/PortfolioValueChart";
import PerformanceMetrics from "../../components/PerformanceMetrics";
import LoadingSpinner from "../../components/LoadingSpinner";
import Tooltip from "../../components/Tooltip";
import Navigation from "../../components/layout/Navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function DashboardContent() {
  const { portfolioState, valueHistory, performance, recentDecisions, health } = await getDashboardData();

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  const getPnLColor = (value: number) => value >= 0 ? "text-emerald-600" : "text-red-600";

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-stone-50 text-stone-900 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-6xl space-y-8">
          {/* Header */}
          <header className="flex items-center justify-between bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <div>
              <h1 className="text-3xl font-semibold text-stone-800">
                Dashboard
              </h1>
              <div className="text-sm text-stone-500 mt-1 flex items-center gap-2">
                <span>Autonomous paper trading system</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  Status: 
                  <span className={health.status === "ok" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                    {health.status}
                  </span>
                  <Tooltip content="Backend API connection status" />
                </span>
                {portfolioState.market_data_timestamp && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      Updated: {new Date(portfolioState.market_data_timestamp).toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      <Tooltip content="Last time market prices were updated" />
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1">
                <div className="text-3xl font-mono text-stone-800">
                  {formatCurrency(portfolioState.current_value)}
                </div>
                <Tooltip content="Total portfolio value: cash + current market value of all holdings" />
              </div>
              <div className="text-sm text-stone-500">
                Portfolio Value
              </div>
              {portfolioState.unrealized_pnl !== 0 && (
                <div className="flex items-center justify-end gap-1">
                  <div className={`text-sm font-mono ${getPnLColor(portfolioState.unrealized_pnl)}`}>
                    {formatCurrency(portfolioState.unrealized_pnl)} ({formatPercent(portfolioState.unrealized_pnl_pct)})
                  </div>
                  <Tooltip content="Profit/loss on current holdings compared to purchase price" />
                </div>
              )}
            </div>
          </header>

          {/* Performance Overview */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-medium text-stone-700">Performance Overview</h2>
              <Tooltip content="Key metrics showing how the portfolio has performed over time" />
            </div>
            <PerformanceMetrics metrics={performance} />
          </section>

          {/* Main Dashboard Grid */}
          <section className="grid gap-6 lg:grid-cols-3">
            {/* Portfolio Chart */}
            <div className="lg:col-span-2 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
              <PortfolioValueChart 
                snapshots={valueHistory.snapshots}
                className="w-full"
              />
              <div className="mt-6 grid grid-cols-4 gap-4 text-sm pt-4 border-t border-stone-100">
                <div className="flex items-center gap-1">
                  <div>
                    <div className="text-stone-500">Cash</div>
                    <div className="font-mono text-stone-800">{formatCurrency(portfolioState.cash_balance)}</div>
                  </div>
                  <Tooltip content="Available cash for trading" />
                </div>
                <div className="flex items-center gap-1">
                  <div>
                    <div className="text-stone-500">Equity</div>
                    <div className="font-mono text-stone-800">{formatCurrency(portfolioState.equity_value)}</div>
                  </div>
                  <Tooltip content="Current market value of all stock holdings" />
                </div>
                <div className="flex items-center gap-1">
                  <div>
                    <div className="text-stone-500">Cost Basis</div>
                    <div className="font-mono text-stone-800">{formatCurrency(portfolioState.cost_basis)}</div>
                  </div>
                  <Tooltip content="Total amount paid for all current holdings" />
                </div>
                <div className="flex items-center gap-1">
                  <div>
                    <div className="text-stone-500">Unrealized P&L</div>
                    <div className={`font-mono ${getPnLColor(portfolioState.unrealized_pnl)}`}>
                      {formatCurrency(portfolioState.unrealized_pnl)}
                    </div>
                  </div>
                  <Tooltip content="Profit/loss if all positions were sold now" />
                </div>
              </div>
            </div>

            {/* Portfolio Summary */}
            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-stone-700">Portfolio Summary</h3>
                <Link 
                  href="/portfolio" 
                  className="text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
                >
                  View all →
                </Link>
              </div>
              
              {/* Allocation */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-stone-600">Cash</span>
                    <span className="font-mono text-stone-800">{formatCurrency(portfolioState.cash_balance)}</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${(portfolioState.cash_balance / portfolioState.current_value) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    {((portfolioState.cash_balance / portfolioState.current_value) * 100).toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-stone-600">Equity</span>
                    <span className="font-mono text-stone-800">{formatCurrency(portfolioState.equity_value)}</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${(portfolioState.equity_value / portfolioState.current_value) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    {((portfolioState.equity_value / portfolioState.current_value) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Top Positions */}
              <div>
                <h4 className="text-sm font-medium text-stone-600 mb-3">Top Holdings</h4>
                {portfolioState.positions.length > 0 ? (
                  <div className="space-y-3">
                    {portfolioState.positions
                      .sort((a, b) => b.current_value - a.current_value)
                      .slice(0, 3)
                      .map((position) => (
                        <div key={position.symbol} className="flex items-center justify-between text-sm p-2 rounded-lg bg-stone-50">
                          <div>
                            <div className="font-mono text-stone-800 font-medium">{position.symbol}</div>
                            <div className="text-xs text-stone-500">
                              {position.quantity} shares
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-stone-800">
                              {formatCurrency(position.current_value)}
                            </div>
                            <div className={`text-xs font-medium ${getPnLColor(position.unrealized_pnl_pct)}`}>
                              {formatPercent(position.unrealized_pnl_pct)}
                            </div>
                          </div>
                        </div>
                      ))}
                    {portfolioState.positions.length > 3 && (
                      <div className="text-xs text-stone-500 text-center pt-2">
                        +{portfolioState.positions.length - 3} more positions
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-stone-400 py-4 bg-stone-50 rounded-lg">
                    No positions yet
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Recent AI Decisions */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium text-stone-700">Recent AI Decisions</h2>
                <Tooltip content="Trading decisions made by the AI based on market analysis" />
              </div>
              <Link 
                href="/decisions" 
                className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
              >
                View all decisions →
              </Link>
            </div>
            
            {recentDecisions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentDecisions.map((decision) => (
                  <div key={decision.decision_id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-stone-500">#{decision.decision_id}</span>
                      <span className="text-xs text-stone-500">
                        {new Date(decision.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-stone-800 mb-3">
                      {decision.action_summary}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">Confidence:</span>
                      <span className="text-xs font-mono text-emerald-600 font-medium">
                        {(decision.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-stone-400 py-8 rounded-lg border border-stone-200 bg-white">
                No decisions yet
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading dashboard..." />}>
      <DashboardContent />
    </Suspense>
  );
}
