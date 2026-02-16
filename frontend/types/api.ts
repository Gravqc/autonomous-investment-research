// Portfolio Types
export interface Position {
  symbol: string;
  quantity: number;
  avg_price: number;
  current_value?: number;
  unrealized_pnl?: number;
}

export interface PortfolioState {
  portfolio_id: number;
  current_value: number;
  cash_balance: number;
  equity_value: number;
  snapshot_date: string;
  positions: Position[];
}

export interface PortfolioSnapshot {
  date: string;
  total_value: number;
  cash_balance: number;
  equity_value: number;
}

export interface PortfolioValueHistory {
  snapshots: PortfolioSnapshot[];
  latest_snapshot_date: string;
  total_return_pct: number;
  days_tracked: number;
}

export interface PerformanceMetrics {
  total_return_pct: number;
  total_return_amount: number;
  max_drawdown_pct: number;
  days_tracked: number;
  starting_value: number;
  current_value: number;
  best_day_return: number;
  worst_day_return: number;
}

// Decision Types
export interface TradeExecution {
  trade_id: number;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  total_value: number;
  executed_at: string;
}

export interface TradeOutcome {
  position_change: string;
  unrealized_pnl?: number;
  days_held?: number;
  outcome_status: string;
}

export interface DecisionSummary {
  decision_id: number;
  action_summary: string;
  confidence: number;
  model_used: string;
  created_at: string;
}

export interface DecisionWithOutcome {
  decision_id: number;
  action_summary: string;
  confidence: number;
  reasoning: string;
  model_used: string;
  created_at: string;
  trade?: TradeExecution;
  outcome?: TradeOutcome;
}

export interface DecisionDetail {
  decision_id: number;
  portfolio_id: number;
  action_summary: string;
  confidence: number;
  reasoning: string;
  raw_llm_output: string;
  model_used: string;
  created_at: string;
  trade?: TradeExecution;
}

// Trade Types
export interface TradeRecord {
  trade_id: number;
  portfolio_id: number;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  total_value: number;
  executed_at: string;
  decision_id?: number;
}

export interface RecentTrades {
  trades: TradeRecord[];
  total_trades: number;
}

// Legacy types for backward compatibility
export interface Portfolio {
  total_value: number;
  cash: number;
  positions: { symbol: string; shares: number }[];
}

export interface Decision {
  symbol: string;
  action: string;
  confidence: number;
}

export interface Health {
  status: string;
}