import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import type { DecisionDetail, TradeExecution } from '@/types/api';

interface DbDecision {
  id: number;
  portfolio_id: number;
  action_summary: string;
  confidence: number;
  reasoning: string;
  raw_llm_output: string;
  model_used: string;
  created_at: string;
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decisionId = parseInt(id, 10);
    
    if (isNaN(decisionId)) {
      return NextResponse.json({ error: 'Invalid decision ID' }, { status: 400 });
    }
    
    const decision = await supabase
      .from('decisions')
      .select('*')
      .eq('id', decisionId)
      .maybeSingle();
    
    if (!decision.data) {
      return NextResponse.json({ error: `Decision ${decisionId} not found` }, { status: 404 });
    }
    
    const decisionData = decision.data as unknown as DbDecision;
    
    const trade = await supabase
      .from('trades')
      .select('*')
      .eq('decision_id', decisionId)
      .limit(1)
      .maybeSingle();
    
    let tradeExecution: TradeExecution | undefined;
    
    if (trade.data) {
      const tradeData = trade.data as unknown as DbTrade;
      tradeExecution = {
        trade_id: tradeData.id,
        symbol: tradeData.symbol,
        side: tradeData.side,
        quantity: parseFloat(String(tradeData.quantity)),
        price: parseFloat(String(tradeData.price)),
        total_value: parseFloat(String(tradeData.total_value)),
        executed_at: tradeData.executed_at,
      };
    }
    
    const response: DecisionDetail = {
      decision_id: decisionData.id,
      portfolio_id: decisionData.portfolio_id,
      action_summary: decisionData.action_summary,
      confidence: parseFloat(String(decisionData.confidence)),
      reasoning: decisionData.reasoning,
      raw_llm_output: decisionData.raw_llm_output,
      model_used: decisionData.model_used,
      created_at: decisionData.created_at,
      trade: tradeExecution,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in decisions/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
