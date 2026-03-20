import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import type { DecisionSummary } from '@/types/api';

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    
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
    
    const response: DecisionSummary[] = decisionsData.map(d => ({
      decision_id: d.id,
      action_summary: d.action_summary,
      confidence: parseFloat(String(d.confidence)),
      model_used: d.model_used,
      created_at: d.created_at,
    }));
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in decisions/recent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
