import { portfolioApi, tradeApi, healthApi } from "../../lib/api";
import PortfolioValueChart from "../../components/PortfolioValueChart";
import PerformanceMetrics from "../../components/PerformanceMetrics";
import Link from "next/link";

export default async function PortfolioPage() {
  try {
    const [portfolioState, valueHistory, performance, recentTrades, health] = await Promise.all([
      portfolioApi.getCurrentState(),
      portfolioApi.getValueHistory(60), // 60 days for more detailed view
      portfolioApi.getPerformanceMetrics(),
      tradeApi.getRecent(20),
      healthApi.check(),
    ]);

    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-8">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <header className="flex items-center justify-between">
            <div>
              <Link 
                href="/" 
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors mb-2 inline-block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-semibold">Portfolio Details</h1>
              <p className="text-sm text-slate-400 mt-1">
                Complete portfolio analysis and position tracking
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono text-slate-50">
                ₹{portfolioState.current_value.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">
                Total Value • {new Date(portfolioState.snapshot_date).toLocaleDateString()}
              </div>
            </div>
          </header>

          {/* Performance Metrics */}
          <section>
            <h2 className="text-lg font-medium text-slate-300 mb-4">Performance Overview</h2>
            <PerformanceMetrics metrics={performance} />
          </section>

          {/* Portfolio Chart and Allocation */}
          <section className="grid gap-6 lg:grid-cols-3">
            {/* Portfolio Value Chart */}
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <h3 className="text-lg font-medium text-slate-300 mb-4">Portfolio Value History</h3>
              <PortfolioValueChart 
                snapshots={valueHistory.snapshots}
                className="w-full"
              />
            </div>

            {/* Cash vs Equity Allocation */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <h3 className="text-lg font-medium text-slate-300 mb-4">Asset Allocation</h3>
              
              {/* Simple allocation visualization */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Cash</span>
                    <span className="font-mono">₹{portfolioState.cash_balance.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full" 
                      style={{ 
                        width: `${(portfolioState.cash_balance / portfolioState.current_value) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {((portfolioState.cash_balance / portfolioState.current_value) * 100).toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Equity</span>
                    <span className="font-mono">₹{portfolioState.equity_value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-emerald-400 h-2 rounded-full" 
                      style={{ 
                        width: `${(portfolioState.equity_value / portfolioState.current_value) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {((portfolioState.equity_value / portfolioState.current_value) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="text-sm text-slate-400 mb-2">Portfolio Stats</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Positions</span>
                    <span className="font-mono">{portfolioState.positions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Trades</span>
                    <span className="font-mono">{recentTrades.total_trades}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Current Positions */}
          <section>
            <h2 className="text-lg font-medium text-slate-300 mb-4">Current Positions</h2>
            
            {portfolioState.positions.length > 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-slate-800 bg-slate-900/60 text-sm text-slate-400">
                  <span>Symbol</span>
                  <span className="text-right">Quantity</span>
                  <span className="text-right">Avg Price</span>
                  <span className="text-right">Current Value</span>
                  <span className="text-right">Weight</span>
                </div>
                {portfolioState.positions.map((position) => {
                  const currentValue = position.quantity * position.avg_price;
                  const weight = (currentValue / portfolioState.equity_value) * 100;
                  
                  return (
                    <div key={position.symbol} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-slate-900/60 hover:bg-slate-900/20 transition-colors">
                      <span className="font-mono text-slate-300">{position.symbol}</span>
                      <span className="text-right font-mono">{position.quantity}</span>
                      <span className="text-right font-mono">₹{position.avg_price.toLocaleString()}</span>
                      <span className="text-right font-mono">₹{currentValue.toLocaleString()}</span>
                      <span className="text-right font-mono text-slate-400">{weight.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12 rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="text-lg mb-2">No positions</div>
                <div className="text-sm">Portfolio is currently 100% cash</div>
              </div>
            )}
          </section>

          {/* Recent Trades */}
          <section>
            <h2 className="text-lg font-medium text-slate-300 mb-4">Recent Trades</h2>
            
            {recentTrades.trades.length > 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-slate-800 bg-slate-900/60 text-sm text-slate-400">
                  <span>Date</span>
                  <span>Symbol</span>
                  <span>Side</span>
                  <span className="text-right">Quantity</span>
                  <span className="text-right">Price</span>
                  <span className="text-right">Total Value</span>
                </div>
                {recentTrades.trades.map((trade) => (
                  <div key={trade.trade_id} className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-slate-900/60 hover:bg-slate-900/20 transition-colors">
                    <span className="text-sm text-slate-400">
                      {new Date(trade.executed_at).toLocaleDateString()}
                    </span>
                    <span className="font-mono text-slate-300">{trade.symbol}</span>
                    <span className={`text-sm font-medium ${
                      trade.side === "BUY" ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {trade.side}
                    </span>
                    <span className="text-right font-mono">{trade.quantity}</span>
                    <span className="text-right font-mono">₹{trade.price.toLocaleString()}</span>
                    <span className="text-right font-mono">₹{trade.total_value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12 rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="text-lg mb-2">No trades yet</div>
                <div className="text-sm">No trades have been executed</div>
              </div>
            )}
          </section>

          {/* Navigation */}
          <section className="flex justify-center gap-4 pt-8">
            <Link 
              href="/" 
              className="px-6 py-3 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Back to Dashboard
            </Link>
            <Link 
              href="/decisions" 
              className="px-6 py-3 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              View AI Decisions
            </Link>
          </section>
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Unable to Load Portfolio</h1>
          <p className="text-slate-400 mb-4">
            Error: {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Link 
            href="/" 
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }
}