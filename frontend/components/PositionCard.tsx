import { Position } from "../types/api";

interface PositionCardProps {
  position: Position;
  className?: string;
}

export default function PositionCard({ position, className = "" }: PositionCardProps) {
  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  
  const getPnLColor = (value: number) => value >= 0 ? "text-emerald-400" : "text-red-400";
  const getPnLBgColor = (value: number) => value >= 0 ? "bg-emerald-900/20" : "bg-red-900/20";

  return (
    <div className={`rounded-lg border border-slate-800 bg-slate-950/60 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-mono text-lg text-slate-50">{position.symbol}</h3>
          <div className="text-sm text-slate-400">
            {position.quantity} shares
            {position.days_held && (
              <span className="ml-2">• {position.days_held} days held</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono text-slate-50">
            {formatCurrency(position.current_value)}
          </div>
          <div className="text-sm text-slate-400">
            Current Value
          </div>
        </div>
      </div>

      {/* Price Information */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-xs text-slate-400">Avg Cost</div>
          <div className="font-mono text-slate-300">₹{position.avg_price.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Current Price</div>
          <div className="font-mono text-slate-300">₹{position.current_price.toLocaleString()}</div>
        </div>
      </div>

      {/* P&L Section */}
      <div className={`rounded-lg p-3 ${getPnLBgColor(position.unrealized_pnl)}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Unrealized P&L</div>
            <div className={`font-mono text-lg ${getPnLColor(position.unrealized_pnl)}`}>
              {formatCurrency(position.unrealized_pnl)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Return</div>
            <div className={`font-mono text-lg ${getPnLColor(position.unrealized_pnl_pct)}`}>
              {formatPercent(position.unrealized_pnl_pct)}
            </div>
          </div>
        </div>
      </div>

      {/* Cost Basis */}
      <div className="mt-3 pt-3 border-t border-slate-800">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Cost Basis</span>
          <span className="font-mono text-slate-300">{formatCurrency(position.cost_basis)}</span>
        </div>
      </div>
    </div>
  );
}