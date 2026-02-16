"use client";

import { PortfolioSnapshot } from "../types/api";

interface PortfolioValueChartProps {
  snapshots: PortfolioSnapshot[];
  className?: string;
}

export default function PortfolioValueChart({ snapshots, className = "" }: PortfolioValueChartProps) {
  if (!snapshots || snapshots.length === 0) {
    return (
      <div className={`flex items-center justify-center h-48 text-slate-400 ${className}`}>
        No data available
      </div>
    );
  }

  // Simple SVG line chart
  const width = 400;
  const height = 200;
  const padding = 40;

  const values = snapshots.map(s => s.total_value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  const points = snapshots.map((snapshot, index) => {
    const x = padding + (index / (snapshots.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((snapshot.total_value - minValue) / valueRange) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const currentValue = values[values.length - 1];
  const startValue = values[0];
  const returnPct = ((currentValue - startValue) / startValue) * 100;
  const isPositive = returnPct >= 0;

  return (
    <div className={className}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-300">Portfolio Value</h3>
          <div className={`text-sm font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{returnPct.toFixed(2)}%
          </div>
        </div>
        <div className="text-2xl font-mono text-slate-50">
          ₹{currentValue.toLocaleString()}
        </div>
      </div>
      
      <div className="relative">
        <svg width={width} height={height} className="w-full h-auto">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Chart line */}
          <polyline
            fill="none"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth="2"
            points={points}
          />
          
          {/* Data points */}
          {snapshots.map((snapshot, index) => {
            const x = padding + (index / (snapshots.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((snapshot.total_value - minValue) / valueRange) * (height - 2 * padding);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={isPositive ? "#10b981" : "#ef4444"}
                className="hover:r-4 transition-all"
              />
            );
          })}
        </svg>
        
        {/* Date labels */}
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>{snapshots[0]?.date}</span>
          <span>{snapshots[snapshots.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
}