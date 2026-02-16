import { decisionApi, healthApi } from "../../lib/api";
import DecisionCard from "../../components/DecisionCard";
import Link from "next/link";

export default async function DecisionsPage() {
  try {
    const [decisionsWithOutcomes, health] = await Promise.all([
      decisionApi.getWithOutcomes(50),
      healthApi.check(),
    ]);

    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-8">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <header className="flex items-center justify-between">
            <div>
              <Link 
                href="/" 
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors mb-2 inline-block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-semibold">AI Decision Timeline</h1>
              <p className="text-sm text-slate-400 mt-1">
                Complete history of AI investment decisions with outcomes
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono text-slate-50">
                {decisionsWithOutcomes.length} decisions
              </div>
              <div className="text-sm text-slate-400">
                Backend: <span className={health.status === "ok" ? "text-emerald-400" : "text-red-400"}>
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
                  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                    <div className="text-2xl font-mono text-slate-50">{totalDecisions}</div>
                    <div className="text-sm text-slate-400">Total Decisions</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                    <div className="text-2xl font-mono text-emerald-400">{executedDecisions}</div>
                    <div className="text-sm text-slate-400">Executed Trades</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                    <div className="text-2xl font-mono text-yellow-400">{(avgConfidence * 100).toFixed(1)}%</div>
                    <div className="text-sm text-slate-400">Avg Confidence</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                    <div className="text-2xl font-mono text-blue-400">{highConfidenceDecisions}</div>
                    <div className="text-sm text-slate-400">High Confidence</div>
                  </div>
                </>
              );
            })()}
          </section>

          {/* Decision Timeline */}
          <section>
            <h2 className="text-lg font-medium text-slate-300 mb-6">Decision Timeline</h2>
            
            {decisionsWithOutcomes.length > 0 ? (
              <div className="space-y-6">
                {decisionsWithOutcomes.map((decision) => (
                  <DecisionCard 
                    key={decision.decision_id} 
                    decision={decision}
                    className="w-full"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12 rounded-lg border border-slate-800 bg-slate-950/60">
                <div className="text-lg mb-2">No decisions found</div>
                <div className="text-sm">
                  The AI hasn't made any investment decisions yet. 
                  Run the daily workflow to generate decisions.
                </div>
              </div>
            )}
          </section>

          {/* Navigation */}
          <section className="flex justify-center gap-4 pt-8">
            <Link 
              href="/" 
              className="px-6 py-3 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Back to Dashboard
            </Link>
            <Link 
              href="/portfolio" 
              className="px-6 py-3 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              View Portfolio
            </Link>
          </section>
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Unable to Load Decisions</h1>
          <p className="text-slate-400 mb-4">
            Error: {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Link 
            href="/" 
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }
}