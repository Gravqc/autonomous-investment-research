import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import type { Position, PortfolioState } from '@/types/api';

interface DbPortfolio {
  id: number;
  name: string;
  strategy_name: string | null;
  created_at: string;
}

interface DbPortfolioSnapshot {
  id: number;
  portfolio_id: number;
  cash_balance: number;
  equity_value: number;
  total_value: number;
  created_at: string;
}

interface DbPositionSnapshot {
  id: number;
  snapshot_id: number;
  symbol: string;
  quantity: number;
  avg_price: number;
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

async function getMarketPrices(symbols: string[]): Promise<Record<string, number>> {
  return {};
}

export async function GET(request: NextRequest) {
  try {
    const portfolio = await supabase
      .from('portfolios')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (!portfolio.data) {
      return NextResponse.json({ error: 'No portfolio found' }, { status: 404 });
    }
    
    const portfolioData = portfolio.data as unknown as DbPortfolio;
    const portfolioId = portfolioData.id;
    
    const snapshot = await supabase
      .from('portfolio_snapshots')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (!snapshot.data) {
      return NextResponse.json({ error: 'No snapshots found' }, { status: 404 });
    }
    
    const snapshotData = snapshot.data as unknown as DbPortfolioSnapshot;
    
    const positions = await supabase
      .from('position_snapshots')
      .select('*')
      .eq('snapshot_id', snapshotData.id);
    
    const positionsData = positions.data as unknown as DbPositionSnapshot[] || [];
    
    let totalCostBasis = 0;
    const positionList: Position[] = [];
    
    for (const pos of positionsData) {
      const quantity = parseFloat(String(pos.quantity));
      const avgPrice = parseFloat(String(pos.avg_price));
      const currentPrice = avgPrice;
      
      const currentValue = quantity * currentPrice;
      const costBasis = quantity * avgPrice;
      const unrealizedPnl = currentValue - costBasis;
      const unrealizedPnlPct = costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;
      
      const firstTrade = await supabase
        .from('trades')
        .select('executed_at')
        .eq('portfolio_id', portfolioId)
        .eq('symbol', pos.symbol)
        .eq('side', 'BUY')
        .order('executed_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      let daysHeld: number | undefined;
      if (firstTrade.data) {
        const tradeData = firstTrade.data as unknown as DbTrade;
        const executedAt = new Date(tradeData.executed_at);
        daysHeld = Math.floor((Date.now() - executedAt.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      totalCostBasis += costBasis;
      
      positionList.push({
        symbol: pos.symbol,
        quantity,
        avg_price: avgPrice,
        current_price: currentPrice,
        current_value: currentValue,
        cost_basis: costBasis,
        unrealized_pnl: unrealizedPnl,
        unrealized_pnl_pct: unrealizedPnlPct,
        days_held: daysHeld,
      });
    }
    
    const cashBalance = parseFloat(String(snapshotData.cash_balance));
    const equityValue = parseFloat(String(snapshotData.equity_value));
    const totalValue = parseFloat(String(snapshotData.total_value));
    const unrealizedPnl = equityValue - totalCostBasis;
    const unrealizedPnlPct = totalCostBasis > 0 ? (unrealizedPnl / totalCostBasis) * 100 : 0;
    
    const response: PortfolioState = {
      portfolio_id: portfolioId,
      current_value: totalValue,
      cash_balance: cashBalance,
      equity_value: equityValue,
      cost_basis: totalCostBasis,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_pct: unrealizedPnlPct,
      snapshot_date: snapshotData.created_at,
      market_data_timestamp: new Date().toISOString(),
      positions: positionList,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in portfolio/current:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
