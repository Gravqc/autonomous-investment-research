"use client";

import { useState } from "react";
import { DecisionWithOutcome } from "../types/api";

interface DecisionCardProps {
  decision: DecisionWithOutcome;
  className?: string;
}

export default function DecisionCard({ decision, className = "" }: DecisionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionColor = (action: string) => {
    if (action.toUpperCase().includes("BUY")) return "text-emerald-400";
    if (action.toUpperCase().includes("SELL")) return "text-red-400";
    return "text-slate-400";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-emerald-400";
    if (confidence >= 0.6) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className={`rounded-lg border border-slate-800 bg-slate-950/60 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">#{decision.decision_id}</span>
          <span className="text-xs text-slate-500">{formatDate(decision.created_at)}</span>
        </div>
        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">
          {decision.model_used}
        </span>
      </div>

      {/* Action Summary */}
      <div className="mb-3">
        <div className={`text-sm font-medium ${getActionColor(decision.action_summary)}`}>
          {decision.action_summary}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-400">Confidence:</span>
          <span className={`text-xs font-mono ${getConfidenceColor(decision.confidence)}`}>
            {(decision.confidence * 100).toFixed(1)}%
          </span>
          <div className="flex-1 bg-slate-800 rounded-full h-1.5">
            <div
              className={`h-full rounded-full ${
                decision.confidence >= 0.8 ? "bg-emerald-400" :
                decision.confidence >= 0.6 ? "bg-yellow-400" : "bg-red-400"
              }`}
              style={{ width: `${decision.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Trade Execution */}
      {decision.trade && (
        <div className="mb-3 p-2 rounded bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Execution</div>
          <div className="text-sm">
            <span className={decision.trade.side === "BUY" ? "text-emerald-400" : "text-red-400"}>
              {decision.trade.side}
            </span>
            <span className="text-slate-300 ml-1">
              {decision.trade.quantity} {decision.trade.symbol} @ ₹{decision.trade.price}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Total: ₹{decision.trade.total_value.toLocaleString()} • {formatDate(decision.trade.executed_at)}
          </div>
        </div>
      )}

      {/* Outcome */}
      {decision.outcome && (
        <div className="mb-3 p-2 rounded bg-slate-900/40 border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Outcome</div>
          <div className="text-sm text-slate-300">{decision.outcome.position_change}</div>
          {decision.outcome.days_held && (
            <div className="text-xs text-slate-400 mt-1">
              Held for {decision.outcome.days_held} days • Status: {decision.outcome.outcome_status}
            </div>
          )}
        </div>
      )}

      {/* Expandable Reasoning */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left text-xs text-slate-400 hover:text-slate-300 transition-colors"
      >
        {isExpanded ? "Hide" : "Show"} AI Reasoning
      </button>

      {isExpanded && (
        <div className="mt-3 p-3 rounded bg-slate-900/40 border border-slate-700">
          <div className="text-xs text-slate-300 whitespace-pre-wrap">
            {decision.reasoning}
          </div>
        </div>
      )}
    </div>
  );
}