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

function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  return 'http://localhost:3000';
}

async function fetchJson<T>(path: string): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;
  
  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    throw error;
  }
}

export const portfolioApi = {
  getCurrentState: () => fetchJson<PortfolioState>("/api/portfolio/current"),
  getValueHistory: (days: number = 30) => 
    fetchJson<PortfolioValueHistory>(`/api/portfolio/value-history?days=${days}`),
  getPerformanceMetrics: () => fetchJson<PerformanceMetrics>("/api/portfolio/performance"),
};

export const decisionApi = {
  getRecent: (limit: number = 10) => 
    fetchJson<DecisionSummary[]>(`/api/decisions/recent?limit=${limit}`),
  getWithOutcomes: (limit: number = 20) => 
    fetchJson<DecisionWithOutcome[]>(`/api/decisions/with-outcomes?limit=${limit}`),
  getById: (id: number) => fetchJson<DecisionDetail>(`/api/decisions/${id}`),
};

export const tradeApi = {
  getRecent: (limit: number = 20) => 
    fetchJson<RecentTrades>(`/api/trades/recent?limit=${limit}`),
  getForDecision: (decisionId: number) => 
    fetchJson<TradeRecord[]>(`/api/trades/for-decision/${decisionId}`),
};

export const healthApi = {
  check: () => fetchJson<Health>("/api/health"),
};

export async function getDashboardData() {
  try {
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
  } catch (error) {
    console.error('Dashboard data fetch failed:', error);
    throw error;
  }
}
