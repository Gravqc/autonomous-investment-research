import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import type { PerformanceMetrics } from '@/types/api';

interface DbPortfolio {
  id: number;
}

interface DbPortfolioSnapshot {
  id: number;
  portfolio_id: number;
  cash_balance: number;
  equity_value: number;
  total_value: number;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const portfolio = await supabase
      .from('portfolios')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (!portfolio.data) {
      return NextResponse.json({ error: 'No portfolio found' }, { status: 404 });
    }
    
    const portfolioData = portfolio.data as unknown as DbPortfolio;
    const portfolioId = portfolioData.id;
    
    const snapshots = await supabase
      .from('portfolio_snapshots')
      .select('total_value')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: true });
    
    const snapshotsData = snapshots.data as unknown as DbPortfolioSnapshot[] || [];
    
    if (snapshotsData.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 snapshots to calculate performance' }, { status: 400 });
    }
    
    const values = snapshotsData.map(s => parseFloat(String(s.total_value)));
    
    const startingValue = values[0];
    const currentValue = values[values.length - 1];
    
    const totalReturnAmount = currentValue - startingValue;
    const totalReturnPct = startingValue > 0 ? (totalReturnAmount / startingValue) * 100 : 0;
    
    const dailyReturns: number[] = [];
    for (let i = 1; i < values.length; i++) {
      const dailyReturn = values[i - 1] > 0 ? ((values[i] - values[i - 1]) / values[i - 1]) * 100 : 0;
      dailyReturns.push(dailyReturn);
    }
    
    let peak = startingValue;
    let maxDrawdown = 0;
    
    for (const value of values) {
      if (value > peak) {
        peak = value;
      }
      const drawdown = peak > 0 ? ((peak - value) / peak) * 100 : 0;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    const response: PerformanceMetrics = {
      total_return_pct: totalReturnPct,
      total_return_amount: totalReturnAmount,
      max_drawdown_pct: maxDrawdown,
      days_tracked: values.length,
      starting_value: startingValue,
      current_value: currentValue,
      best_day_return: dailyReturns.length > 0 ? Math.max(...dailyReturns) : 0,
      worst_day_return: dailyReturns.length > 0 ? Math.min(...dailyReturns) : 0,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in portfolio/performance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
