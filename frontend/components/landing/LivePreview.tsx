"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface LivePreviewProps {
  portfolioValue: number;
  returnPct: number;
  daysTracked: number;
  decisionsCount: number;
  positionsCount: number;
}

export default function LivePreview({
  portfolioValue,
  returnPct,
  daysTracked,
  decisionsCount,
  positionsCount,
}: LivePreviewProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated counter effect
  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = portfolioValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= portfolioValue) {
        setDisplayValue(portfolioValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [portfolioValue]);

  const formatCurrency = (value: number) => 
    `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const isPositive = returnPct >= 0;

  return (
    <div className="flex flex-col justify-center items-center h-full px-8 md:px-16 lg:px-20">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700 delay-300">
        {/* Portfolio Value */}
        <div className="text-center">
          <div className="text-sm text-stone-500 mb-2">Live Portfolio Value</div>
          <div className="text-4xl md:text-5xl font-bold text-stone-800 font-mono mb-2">
            {formatCurrency(displayValue)}
          </div>
          <div className={`text-lg font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{returnPct.toFixed(2)}% since start
          </div>
        </div>

        {/* Stats Card */}
        <Card className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-stone-800">{daysTracked}</div>
              <div className="text-xs text-stone-500 mt-1">Days Running</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-800">{decisionsCount}</div>
              <div className="text-xs text-stone-500 mt-1">Decisions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-800">{positionsCount}</div>
              <div className="text-xs text-stone-500 mt-1">Positions</div>
            </div>
          </div>
        </Card>

        {/* CTA Button */}
        <Link href="/dashboard" className="block">
          <Button className="w-full text-base h-12 group">
            View Dashboard
            <svg 
              className="w-5 h-5 transition-transform group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </Link>
      </div>
    </div>
  );
}
