import { env } from "../app/env";
import type {
  PortfolioState,
  PortfolioValueHistory,
  PerformanceMetrics,
  DecisionSummary,
  DecisionWithOutcome,
  DecisionDetail,
  RecentTrades,
  TradeRecord,
  Health
} from "../types/api";

const API_BASE_URL = env.NEXT_PUBLIC_FASTAPI_URL;

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store", // Ensure fresh data
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Portfolio API calls
export const portfolioApi = {
  getCurrentState: () => fetchJson<PortfolioState>("/api/portfolio/current"),
  getValueHistory: (days: number = 30) => 
    fetchJson<PortfolioValueHistory>(`/api/portfolio/value-history?days=${days}`),
  getPerformanceMetrics: () => fetchJson<PerformanceMetrics>("/api/portfolio/performance"),
};

// Decision API calls
export const decisionApi = {
  getRecent: (limit: number = 10) => 
    fetchJson<DecisionSummary[]>(`/api/decisions/recent?limit=${limit}`),
  getWithOutcomes: (limit: number = 20) => 
    fetchJson<DecisionWithOutcome[]>(`/api/decisions/with-outcomes?limit=${limit}`),
  getById: (id: number) => fetchJson<DecisionDetail>(`/api/decisions/${id}`),
};

// Trade API calls
export const tradeApi = {
  getRecent: (limit: number = 20) => 
    fetchJson<RecentTrades>(`/api/trades/recent?limit=${limit}`),
  getForDecision: (decisionId: number) => 
    fetchJson<TradeRecord[]>(`/api/trades/for-decision/${decisionId}`),
};

// Health check
export const healthApi = {
  check: () => fetchJson<Health>("/api/health"),
};

// Combined data fetching for dashboard
export async function getDashboardData() {
  const [portfolioState, valueHistory, performance, recentDecisions, health] = await Promise.all([
    portfolioApi.getCurrentState(),
    portfolioApi.getValueHistory(30),
    portfolioApi.getPerformanceMetrics(),
    decisionApi.getRecent(5),
    healthApi.check(),
  ]);

  return {
    portfolioState,
    valueHistory,
    performance,
    recentDecisions,
    health,
  };
}