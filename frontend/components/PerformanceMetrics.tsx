import { PerformanceMetrics as PerformanceMetricsType } from "../types/api";

interface PerformanceMetricsProps {
  metrics: PerformanceMetricsType;
  className?: string;
}

export default function PerformanceMetrics({ metrics, className = "" }: PerformanceMetricsProps) {
  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

  const getReturnColor = (value: number) => value >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {/* Total Return */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
        <div className="text-xs text-slate-400 mb-1">Total Return</div>
        <div className={`text-lg font-mono ${getReturnColor(metrics.total_return_pct)}`}>
          {formatPercent(metrics.total_return_pct)}
        </div>
        <div className={`text-xs ${getReturnColor(metrics.total_return_amount)}`}>
          {formatCurrency(metrics.total_return_amount)}
        </div>
      </div>

      {/* Max Drawdown */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
        <div className="text-xs text-slate-400 mb-1">Max Drawdown</div>
        <div className="text-lg font-mono text-red-400">
          -{metrics.max_drawdown_pct.toFixed(2)}%
        </div>
        <div className="text-xs text-slate-400">
          Peak to trough
        </div>
      </div>

      {/* Best Day */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
        <div className="text-xs text-slate-400 mb-1">Best Day</div>
        <div className="text-lg font-mono text-emerald-400">
          +{metrics.best_day_return.toFixed(2)}%
        </div>
        <div className="text-xs text-slate-400">
          Single day gain
        </div>
      </div>

      {/* Worst Day */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
        <div className="text-xs text-slate-400 mb-1">Worst Day</div>
        <div className="text-lg font-mono text-red-400">
          {metrics.worst_day_return.toFixed(2)}%
        </div>
        <div className="text-xs text-slate-400">
          Single day loss
        </div>
      </div>

      {/* Portfolio Value Range */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 col-span-2">
        <div className="text-xs text-slate-400 mb-1">Portfolio Value</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-300">Start</div>
            <div className="text-sm font-mono">{formatCurrency(metrics.starting_value)}</div>
          </div>
          <div className="text-slate-600">→</div>
          <div>
            <div className="text-sm text-slate-300">Current</div>
            <div className="text-sm font-mono">{formatCurrency(metrics.current_value)}</div>
          </div>
        </div>
      </div>

      {/* Days Tracked */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 col-span-2">
        <div className="text-xs text-slate-400 mb-1">Tracking Period</div>
        <div className="text-lg font-mono text-slate-300">
          {metrics.days_tracked} days
        </div>
        <div className="text-xs text-slate-400">
          Since experiment start
        </div>
      </div>
    </div>
  );
}