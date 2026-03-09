import { PerformanceMetrics as PerformanceMetricsType } from "../types/api";
import Tooltip from "./Tooltip";

interface PerformanceMetricsProps {
  metrics: PerformanceMetricsType;
  className?: string;
}

export default function PerformanceMetrics({ metrics, className = "" }: PerformanceMetricsProps) {
  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

  const getReturnColor = (value: number) => value >= 0 ? "text-emerald-600" : "text-red-600";

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {/* Total Return */}
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-1 mb-1">
          <div className="text-xs text-stone-500">Total Return</div>
          <Tooltip content="Overall profit or loss since the portfolio started" />
        </div>
        <div className={`text-xl font-mono font-semibold ${getReturnColor(metrics.total_return_pct)}`}>
          {formatPercent(metrics.total_return_pct)}
        </div>
        <div className={`text-xs ${getReturnColor(metrics.total_return_amount)}`}>
          {formatCurrency(metrics.total_return_amount)}
        </div>
      </div>

      {/* Max Drawdown */}
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-1 mb-1">
          <div className="text-xs text-stone-500">Max Drawdown</div>
          <Tooltip content="Largest peak-to-trough decline in portfolio value" />
        </div>
        <div className="text-xl font-mono font-semibold text-red-600">
          -{metrics.max_drawdown_pct.toFixed(2)}%
        </div>
        <div className="text-xs text-stone-500">
          Peak to trough
        </div>
      </div>

      {/* Best Day */}
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-1 mb-1">
          <div className="text-xs text-stone-500">Best Day</div>
          <Tooltip content="Best single-day percentage gain" />
        </div>
        <div className="text-xl font-mono font-semibold text-emerald-600">
          +{metrics.best_day_return.toFixed(2)}%
        </div>
        <div className="text-xs text-stone-500">
          Single day gain
        </div>
      </div>

      {/* Worst Day */}
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-1 mb-1">
          <div className="text-xs text-stone-500">Worst Day</div>
          <Tooltip content="Worst single-day percentage loss" />
        </div>
        <div className="text-xl font-mono font-semibold text-red-600">
          {metrics.worst_day_return.toFixed(2)}%
        </div>
        <div className="text-xs text-stone-500">
          Single day loss
        </div>
      </div>

      {/* Portfolio Value Range */}
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm col-span-2">
        <div className="flex items-center gap-1 mb-2">
          <div className="text-xs text-stone-500">Portfolio Value</div>
          <Tooltip content="Portfolio value from start to current" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-stone-600">Start</div>
            <div className="text-sm font-mono text-stone-800">{formatCurrency(metrics.starting_value)}</div>
          </div>
          <div className="text-stone-300">→</div>
          <div>
            <div className="text-sm text-stone-600">Current</div>
            <div className="text-sm font-mono text-stone-800">{formatCurrency(metrics.current_value)}</div>
          </div>
        </div>
      </div>

      {/* Days Tracked */}
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm col-span-2">
        <div className="flex items-center gap-1 mb-1">
          <div className="text-xs text-stone-500">Tracking Period</div>
          <Tooltip content="Number of days the portfolio has been tracked" />
        </div>
        <div className="text-xl font-mono font-semibold text-stone-800">
          {metrics.days_tracked} days
        </div>
        <div className="text-xs text-stone-500">
          Since experiment start
        </div>
      </div>
    </div>
  );
}