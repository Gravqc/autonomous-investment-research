import { Suspense } from "react";
import { portfolioApi, tradeApi, healthApi } from "../../lib/api";
import PortfolioValueChart from "../../components/PortfolioValueChart";
import PerformanceMetrics from "../../components/PerformanceMetrics";
import PositionCard from "../../components/PositionCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import Tooltip from "../../components/Tooltip";
import Navigation from "../../components/layout/Navigation";
import Link from "next/link";

async function PortfolioContent() {
  const [portfolioState, valueHistory, performance, recentTrades, health] = await Promise.all([
    portfolioApi.getCurrentState(),
    portfolioApi.getValueHistory(60),
    portfolioApi.getPerformanceMetrics(),
    tradeApi.getRecent(20),
    healthApi.check(),
  ]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  const getPnLColor = (value: number) => value >= 0 ? "text-emerald-600" : "text-red-600";

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-stone-50 text-stone-900 px-4 py-8">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <div>
            <Link 
              href="/" 
              className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors mb-2 inline-block font-medium"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-semibold text-stone-800">Portfolio Details</h1>
            <p className="text-sm text-stone-500 mt-1">
              Complete portfolio analysis with real-time position tracking
              {portfolioState.market_data_timestamp && (
                <span className="ml-2">
                  • Prices updated: {new Date(portfolioState.market_data_timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono text-stone-800">
              {formatCurrency(portfolioState.current_value)}
            </div>
            <div className="text-sm text-stone-500">
              Total Value • {new Date(portfolioState.snapshot_date).toLocaleDateString('en-IN')}
            </div>
            {portfolioState.unrealized_pnl !== 0 && (
              <div className={`text-sm font-mono ${getPnLColor(portfolioState.unrealized_pnl)}`}>
                {formatCurrency(portfolioState.unrealized_pnl)} ({formatPercent(portfolioState.unrealized_pnl_pct)})
              </div>
            )}
          </div>
        </header>

        {/* Performance Metrics */}
        <section>
          <h2 className="text-lg font-medium text-stone-700 mb-4">Performance Overview</h2>
          <PerformanceMetrics metrics={performance} />
        </section>

        {/* Portfolio Chart and Allocation */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Portfolio Value Chart */}
          <div className="lg:col-span-2 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-medium text-stone-700 mb-4">Portfolio Value History</h3>
            <PortfolioValueChart 
              snapshots={valueHistory.snapshots}
              className="w-full"
            />
          </div>

          {/* Enhanced Asset Allocation */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-medium text-stone-700 mb-4">Asset Allocation</h3>
            
            {/* Allocation visualization */}
            <div className="space-y-4">
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

            {/* Enhanced Portfolio Stats */}
            <div className="mt-6 pt-4 border-t border-stone-100">
              <div className="text-sm text-stone-600 mb-3 font-medium">Portfolio Stats</div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Positions</span>
                  <span className="font-mono text-stone-800">{portfolioState.positions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Total Trades</span>
                  <span className="font-mono text-stone-800">{recentTrades.total_trades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Cost Basis</span>
                  <span className="font-mono text-stone-800">{formatCurrency(portfolioState.cost_basis)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Unrealized P&L</span>
                  <span className={`font-mono ${getPnLColor(portfolioState.unrealized_pnl)}`}>
                    {formatCurrency(portfolioState.unrealized_pnl)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Current Positions */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-medium text-stone-700">Current Positions</h2>
            <Tooltip content="All active stock holdings in the portfolio" />
          </div>
          
          {portfolioState.positions.length > 0 ? (
            <>
              {/* Position Cards for Mobile/Tablet */}
              <div className="grid gap-4 md:grid-cols-2 lg:hidden mb-6">
                {portfolioState.positions
                  .sort((a, b) => b.current_value - a.current_value)
                  .map((position) => (
                    <PositionCard key={position.symbol} position={position} />
                  ))}
              </div>

              {/* Position Table for Desktop */}
              <div className="hidden lg:block rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
                <div className="grid grid-cols-8 gap-4 px-6 py-4 border-b border-stone-200 bg-stone-50 text-sm text-stone-600 font-medium">
                  <span>Symbol</span>
                  <span className="text-right">Quantity</span>
                  <span className="text-right">Avg Price</span>
                  <span className="text-right">Current Price</span>
                  <span className="text-right">Current Value</span>
                  <span className="text-right">Cost Basis</span>
                  <span className="text-right">P&L</span>
                  <span className="text-right">Return %</span>
                </div>
                {portfolioState.positions
                  .sort((a, b) => b.current_value - a.current_value)
                  .map((position) => (
                    <div key={position.symbol} className="grid grid-cols-8 gap-4 px-6 py-4 border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <div>
                        <span className="font-mono text-stone-800 font-medium">{position.symbol}</span>
                        {position.days_held && (
                          <div className="text-xs text-stone-500">{position.days_held}d held</div>
                        )}
                      </div>
                      <span className="text-right font-mono text-stone-800">{position.quantity}</span>
                      <span className="text-right font-mono text-stone-800">₹{position.avg_price.toLocaleString('en-IN')}</span>
                      <span className="text-right font-mono text-stone-800">₹{position.current_price.toLocaleString('en-IN')}</span>
                      <span className="text-right font-mono text-stone-800">{formatCurrency(position.current_value)}</span>
                      <span className="text-right font-mono text-stone-800">{formatCurrency(position.cost_basis)}</span>
                      <span className={`text-right font-mono ${getPnLColor(position.unrealized_pnl)}`}>
                        {formatCurrency(position.unrealized_pnl)}
                      </span>
                      <span className={`text-right font-mono font-medium ${getPnLColor(position.unrealized_pnl_pct)}`}>
                        {formatPercent(position.unrealized_pnl_pct)}
                      </span>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div className="text-center text-stone-400 py-12 rounded-xl border border-stone-200 bg-white">
              <div className="text-lg mb-2">No positions</div>
              <div className="text-sm">Portfolio is currently 100% cash</div>
            </div>
          )}
        </section>

        {/* Recent Trades */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-medium text-stone-700">Recent Trades</h2>
            <Tooltip content="Most recent buy and sell transactions" />
          </div>
          
          {recentTrades.trades.length > 0 ? (
            <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
              <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-stone-200 bg-stone-50 text-sm text-stone-600 font-medium">
                <span>Date</span>
                <span>Symbol</span>
                <span>Side</span>
                <span className="text-right">Quantity</span>
                <span className="text-right">Price</span>
                <span className="text-right">Total Value</span>
              </div>
              {recentTrades.trades.map((trade) => (
                <div key={trade.trade_id} className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <span className="text-sm text-stone-600">
                    {new Date(trade.executed_at).toLocaleDateString('en-IN')}
                  </span>
                  <span className="font-mono text-stone-800 font-medium">{trade.symbol}</span>
                  <span className={`text-sm font-medium ${
                    trade.side === "BUY" ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {trade.side}
                  </span>
                  <span className="text-right font-mono text-stone-800">{trade.quantity}</span>
                  <span className="text-right font-mono text-stone-800">₹{trade.price.toLocaleString('en-IN')}</span>
                  <span className="text-right font-mono text-stone-800">₹{trade.total_value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-stone-400 py-12 rounded-xl border border-stone-200 bg-white">
              <div className="text-lg mb-2">No trades yet</div>
              <div className="text-sm">No trades have been executed</div>
            </div>
          )}
        </section>

        {/* Navigation */}
        <section className="flex justify-center gap-4 pt-4">
          <Link 
            href="/" 
            className="px-6 py-3 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 transition-colors shadow-sm font-medium"
          >
            Back to Dashboard
          </Link>
          <Link 
            href="/decisions" 
            className="px-6 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm font-medium"
          >
            View AI Decisions
          </Link>
        </section>
      </div>
    </main>
    </>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading portfolio details..." />}>
      <PortfolioContent />
    </Suspense>
  );
}
