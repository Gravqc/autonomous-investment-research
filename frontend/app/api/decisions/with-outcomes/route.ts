import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import type { DecisionWithOutcome, TradeExecution, TradeOutcome } from '@/types/api';

interface DbPortfolio {
  id: number;
}

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
    
    const decisions = await supabase
      .from('decisions')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    const decisionsData = decisions.data as unknown as DbDecision[] || [];
    const result: DecisionWithOutcome[] = [];
    
    for (const decision of decisionsData) {
      const trade = await supabase
        .from('trades')
        .select('*')
        .eq('decision_id', decision.id)
        .limit(1)
        .maybeSingle();
      
      let tradeExecution: TradeExecution | undefined;
      let tradeOutcome: TradeOutcome | undefined;
      
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
        
        const executedAt = new Date(tradeData.executed_at);
        const daysSinceTrade = Math.floor((Date.now() - executedAt.getTime()) / (1000 * 60 * 60 * 24));
        
        tradeOutcome = {
          position_change: `${tradeData.side === 'BUY' ? '+' : '-'}${tradeData.quantity} ${tradeData.symbol}`,
          days_held: daysSinceTrade,
          outcome_status: 'pending',
        };
      }
      
      result.push({
        decision_id: decision.id,
        action_summary: decision.action_summary,
        confidence: parseFloat(String(decision.confidence)),
        reasoning: decision.reasoning,
        model_used: decision.model_used,
        created_at: decision.created_at,
        trade: tradeExecution,
        outcome: tradeOutcome,
      });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in decisions/with-outcomes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
