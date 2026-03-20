import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import type { RecentTrades, TradeRecord } from '@/types/api';

interface DbPortfolio {
  id: number;
}

interface DbTrade {
  id: number;
  portfolio_id: number;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  total_value: number;
  executed_at: string;
  decision_id: number | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    
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
    
    const trades = await supabase
      .from('trades')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('executed_at', { ascending: false })
      .limit(limit);
    
    const tradesData = trades.data as unknown as DbTrade[] || [];
    
    const { count } = await supabase
      .from('trades')
      .select('*', { count: 'exact', head: true })
      .eq('portfolio_id', portfolioId);
    
    const tradeRecords: TradeRecord[] = tradesData.map(t => ({
      trade_id: t.id,
      portfolio_id: t.portfolio_id,
      symbol: t.symbol,
      side: t.side,
      quantity: parseFloat(String(t.quantity)),
      price: parseFloat(String(t.price)),
      total_value: parseFloat(String(t.total_value)),
      executed_at: t.executed_at,
      decision_id: t.decision_id ?? undefined,
    }));
    
    const response: RecentTrades = {
      trades: tradeRecords,
      total_trades: count || 0,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in trades/recent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
