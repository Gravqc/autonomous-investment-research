"use client";

import { useState } from "react";
import { PortfolioSnapshot } from "../types/api";
import Tooltip from "./Tooltip";

interface PortfolioValueChartProps {
  snapshots: PortfolioSnapshot[];
  className?: string;
}

export default function PortfolioValueChart({ snapshots, className = "" }: PortfolioValueChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number } | null>(null);

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className={`flex items-center justify-center h-48 text-stone-400 ${className}`}>
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
    return { x, y, snapshot, index };
  });

  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

  const currentValue = values[values.length - 1];
  const startValue = values[0];
  const returnPct = ((currentValue - startValue) / startValue) * 100;
  const isPositive = returnPct >= 0;

  return (
    <div className={className}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-stone-700">Portfolio Value</h3>
            <Tooltip content="Historical portfolio value over time based on daily snapshots" />
          </div>
          <div className={`text-sm font-mono font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{returnPct.toFixed(2)}%
          </div>
        </div>
        <div className="text-2xl font-mono text-stone-800">
          ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </div>
      </div>
      
      <div className="relative">
        <svg 
          width={width} 
          height={height} 
          className="w-full h-auto"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e7e5e4" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Chart line */}
          <polyline
            fill="none"
            stroke={isPositive ? "#059669" : "#dc2626"}
            strokeWidth="2"
            points={pointsString}
          />
          
          {/* Hover line */}
          {hoveredPoint && (
            <line
              x1={points[hoveredPoint.index].x}
              y1={padding}
              x2={points[hoveredPoint.index].x}
              y2={height - padding}
              stroke="#78716c"
              strokeWidth="1"
              strokeDasharray="4 2"
            />
          )}
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              {/* Invisible larger circle for easier hovering */}
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint({ index, x: point.x, y: point.y })}
              />
              {/* Visible circle */}
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint?.index === index ? "5" : "3"}
                fill={isPositive ? "#059669" : "#dc2626"}
                className="transition-all pointer-events-none"
              />
            </g>
          ))}
        </svg>
        
        {/* Hover tooltip */}
        {hoveredPoint !== null && (
          <div 
            className="absolute bg-white border border-stone-200 rounded-lg shadow-lg px-3 py-2 text-xs pointer-events-none z-10"
            style={{
              left: `${(points[hoveredPoint.index].x / width) * 100}%`,
              top: `${(points[hoveredPoint.index].y / height) * 100}%`,
              transform: 'translate(-50%, -120%)'
            }}
          >
            <div className="font-medium text-stone-800 mb-1">
              {new Date(snapshots[hoveredPoint.index].date).toLocaleDateString('en-IN', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <div className="font-mono text-stone-700">
              ₹{snapshots[hoveredPoint.index].total_value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-stone-500 mt-1">
              Cash: ₹{snapshots[hoveredPoint.index].cash_balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-stone-500">
              Equity: ₹{snapshots[hoveredPoint.index].equity_value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
        )}
        
        {/* Date labels */}
        <div className="flex justify-between mt-2 text-xs text-stone-500">
          <span>{new Date(snapshots[0]?.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
          <span>{new Date(snapshots[snapshots.length - 1]?.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}