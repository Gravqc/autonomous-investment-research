import { Suspense } from "react";
import { getDashboardData } from "../lib/api";
import Hero from "../components/landing/Hero";
import LivePreview from "../components/landing/LivePreview";
import LoadingSpinner from "../components/LoadingSpinner";

async function LandingContent() {
  try {
    const { portfolioState, performance } = await getDashboardData();

    return (
      <main className="min-h-screen flex flex-col md:flex-row">
        {/* Left Side - Hero */}
        <div className="w-full md:w-3/5 bg-stone-100 min-h-screen">
          <Hero />
        </div>

        {/* Right Side - Live Preview */}
        <div className="w-full md:w-2/5 bg-white min-h-screen">
          <LivePreview
            portfolioValue={portfolioState.current_value}
            returnPct={performance.total_return_pct}
            daysTracked={performance.days_tracked}
            decisionsCount={5} // You can pass this from API if needed
            positionsCount={portfolioState.positions.length}
          />
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center px-4">
          <h1 className="text-2xl font-semibold text-stone-800 mb-4">
            Unable to Load Data
          </h1>
          <p className="text-stone-600 mb-6">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
          <p className="text-sm text-stone-500">
            Please ensure the backend server is running.
          </p>
        </div>
      </main>
    );
  }
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
      <LandingContent />
    </Suspense>
  );
}
