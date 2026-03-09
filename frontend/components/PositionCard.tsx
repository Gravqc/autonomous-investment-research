import { Position } from "../types/api";

interface PositionCardProps {
  position: Position;
  className?: string;
}

export default function PositionCard({ position, className = "" }: PositionCardProps) {
  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  
  const getPnLColor = (value: number) => value >= 0 ? "text-emerald-600" : "text-red-600";
  const getPnLBgColor = (value: number) => value >= 0 ? "bg-emerald-50" : "bg-red-50";

  return (
    <div className={`rounded-lg border border-stone-200 bg-white p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-mono text-lg text-stone-800 font-semibold">{position.symbol}</h3>
          <div className="text-sm text-stone-500">
            {position.quantity} shares
            {position.days_held && (
              <span className="ml-2">• {position.days_held} days held</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono text-stone-800">
            {formatCurrency(position.current_value)}
          </div>
          <div className="text-sm text-stone-500">
            Current Value
          </div>
        </div>
      </div>

      {/* Price Information */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-xs text-stone-500">Avg Cost</div>
          <div className="font-mono text-stone-800">₹{position.avg_price.toLocaleString('en-IN')}</div>
        </div>
        <div>
          <div className="text-xs text-stone-500">Current Price</div>
          <div className="font-mono text-stone-800">₹{position.current_price.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* P&L Section */}
      <div className={`rounded-lg p-3 ${getPnLBgColor(position.unrealized_pnl)}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-600">Unrealized P&L</div>
            <div className={`font-mono text-lg font-semibold ${getPnLColor(position.unrealized_pnl)}`}>
              {formatCurrency(position.unrealized_pnl)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-stone-600">Return</div>
            <div className={`font-mono text-lg font-semibold ${getPnLColor(position.unrealized_pnl_pct)}`}>
              {formatPercent(position.unrealized_pnl_pct)}
            </div>
          </div>
        </div>
      </div>

      {/* Cost Basis */}
      <div className="mt-3 pt-3 border-t border-stone-100">
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">Cost Basis</span>
          <span className="font-mono text-stone-800">{formatCurrency(position.cost_basis)}</span>
        </div>
      </div>
    </div>
  );
}