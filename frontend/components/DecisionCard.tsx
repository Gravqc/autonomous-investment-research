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
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionColor = (action: string) => {
    if (action.toUpperCase().includes("BUY")) return "text-emerald-600";
    if (action.toUpperCase().includes("SELL")) return "text-red-600";
    return "text-stone-600";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-emerald-600";
    if (confidence >= 0.6) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className={`rounded-lg border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500">#{decision.decision_id}</span>
          <span className="text-xs text-stone-500">{formatDate(decision.created_at)}</span>
        </div>
        <span className="text-xs px-2 py-1 rounded bg-stone-100 text-stone-700 font-medium">
          {decision.model_used}
        </span>
      </div>

      {/* Action Summary */}
      <div className="mb-3">
        <div className={`text-sm font-medium ${getActionColor(decision.action_summary)}`}>
          {decision.action_summary}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-stone-500">Confidence:</span>
          <span className={`text-xs font-mono font-medium ${getConfidenceColor(decision.confidence)}`}>
            {(decision.confidence * 100).toFixed(0)}%
          </span>
          <div className="flex-1 bg-stone-100 rounded-full h-2">
            <div
              className={`h-full rounded-full transition-all ${
                decision.confidence >= 0.8 ? "bg-emerald-500" :
                decision.confidence >= 0.6 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${decision.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Trade Execution */}
      {decision.trade && (
        <div className="mb-3 p-3 rounded bg-stone-50 border border-stone-200">
          <div className="text-xs text-stone-500 mb-1 font-medium">Execution</div>
          <div className="text-sm">
            <span className={`font-medium ${decision.trade.side === "BUY" ? "text-emerald-600" : "text-red-600"}`}>
              {decision.trade.side}
            </span>
            <span className="text-stone-800 ml-1">
              {decision.trade.quantity} {decision.trade.symbol} @ ₹{decision.trade.price.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Total: ₹{decision.trade.total_value.toLocaleString('en-IN')} • {formatDate(decision.trade.executed_at)}
          </div>
        </div>
      )}

      {/* Outcome */}
      {decision.outcome && (
        <div className="mb-3 p-3 rounded bg-blue-50 border border-blue-200">
          <div className="text-xs text-blue-700 mb-1 font-medium">Outcome</div>
          <div className="text-sm text-stone-800">{decision.outcome.position_change}</div>
          {decision.outcome.days_held && (
            <div className="text-xs text-stone-600 mt-1">
              Held for {decision.outcome.days_held} days • Status: {decision.outcome.outcome_status}
            </div>
          )}
        </div>
      )}

      {/* Expandable Reasoning */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
      >
        {isExpanded ? "Hide" : "Show"} AI Reasoning
      </button>

      {isExpanded && (
        <div className="mt-3 p-3 rounded bg-stone-50 border border-stone-200">
          <div className="text-xs text-stone-700 whitespace-pre-wrap leading-relaxed">
            {decision.reasoning}
          </div>
        </div>
      )}
    </div>
  );
}