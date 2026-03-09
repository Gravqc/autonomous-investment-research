import { Suspense } from "react";
import { decisionApi, healthApi } from "../../lib/api";
import DecisionCard from "../../components/DecisionCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import Tooltip from "../../components/Tooltip";
import Link from "next/link";

async function DecisionsContent() {
  const [decisionsWithOutcomes, health] = await Promise.all([
    decisionApi.getWithOutcomes(50),
    healthApi.check(),
  ]);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 px-4 py-8">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <div>
            <Link 
              href="/" 
              className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors mb-2 inline-block font-medium"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-semibold text-stone-800">AI Decision Timeline</h1>
            <p className="text-sm text-stone-500 mt-1">
              Complete history of AI investment decisions with outcomes
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-mono text-stone-800">
              {decisionsWithOutcomes.length} decisions
            </div>
            <div className="text-sm text-stone-500">
              Backend: <span className={health.status === "ok" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                {health.status}
              </span>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => {
            const totalDecisions = decisionsWithOutcomes.length;
            const executedDecisions = decisionsWithOutcomes.filter(d => d.trade).length;
            const avgConfidence = totalDecisions > 0 
              ? decisionsWithOutcomes.reduce((sum, d) => sum + d.confidence, 0) / totalDecisions 
              : 0;
            const highConfidenceDecisions = decisionsWithOutcomes.filter(d => d.confidence >= 0.8).length;

            return (
              <>
                <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-2xl font-mono text-stone-800 font-semibold">{totalDecisions}</div>
                    <Tooltip content="Total number of decisions made by the AI" />
                  </div>
                  <div className="text-sm text-stone-500">Total Decisions</div>
                </div>
                <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-2xl font-mono text-emerald-600 font-semibold">{executedDecisions}</div>
                    <Tooltip content="Decisions that resulted in actual trades" />
                  </div>
                  <div className="text-sm text-stone-500">Executed Trades</div>
                </div>
                <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-2xl font-mono text-amber-600 font-semibold">{(avgConfidence * 100).toFixed(0)}%</div>
                    <Tooltip content="Average confidence level across all decisions" />
                  </div>
                  <div className="text-sm text-stone-500">Avg Confidence</div>
                </div>
                <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-2xl font-mono text-blue-600 font-semibold">{highConfidenceDecisions}</div>
                    <Tooltip content="Decisions with confidence level above 80%" />
                  </div>
                  <div className="text-sm text-stone-500">High Confidence</div>
                </div>
              </>
            );
          })()}
        </section>

        {/* Decision Timeline */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg font-medium text-stone-700">Decision Timeline</h2>
            <Tooltip content="Chronological list of all AI trading decisions" />
          </div>
          
          {decisionsWithOutcomes.length > 0 ? (
            <div className="space-y-4">
              {decisionsWithOutcomes.map((decision) => (
                <DecisionCard 
                  key={decision.decision_id} 
                  decision={decision}
                  className="w-full"
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-stone-400 py-12 rounded-lg border border-stone-200 bg-white">
              <div className="text-lg mb-2">No decisions found</div>
              <div className="text-sm">
                The AI hasn't made any investment decisions yet. 
                Run the daily workflow to generate decisions.
              </div>
            </div>
          )}
        </section>

        {/* Navigation */}
        <section className="flex justify-center gap-4 pt-4">
          <Link 
            href="/" 
            className="px-6 py-3 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 transition-colors shadow-sm font-medium"
          >
            Back to Dashboard
          </Link>
          <Link 
            href="/portfolio" 
            className="px-6 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm font-medium"
          >
            View Portfolio
          </Link>
        </section>
      </div>
    </main>
  );
}

export default function DecisionsPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading AI decisions..." />}>
      <DecisionsContent />
    </Suspense>
  );
}
