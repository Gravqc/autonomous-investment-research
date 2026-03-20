import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import type { TradeRecord } from '@/types/api';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ decisionId: string }> }
) {
  try {
    const { decisionId } = await params;
    const parsedDecisionId = parseInt(decisionId, 10);
    
    if (isNaN(parsedDecisionId)) {
      return NextResponse.json({ error: 'Invalid decision ID' }, { status: 400 });
    }
    
    const trades = await supabase
      .from('trades')
      .select('*')
      .eq('decision_id', parsedDecisionId)
      .order('executed_at', { ascending: false });
    
    const tradesData = trades.data as unknown as DbTrade[] || [];
    
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
    
    return NextResponse.json(tradeRecords);
  } catch (error) {
    console.error('Error in trades/for-decision:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
