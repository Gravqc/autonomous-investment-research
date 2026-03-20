import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import type { PortfolioValueHistory, PortfolioSnapshot } from '@/types/api';

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
    const searchParams = request.nextUrl.searchParams;
    const days = Math.min(365, Math.max(1, parseInt(searchParams.get('days') || '30', 10)));
    
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
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const snapshots = await supabase
      .from('portfolio_snapshots')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });
    
    const snapshotsData = snapshots.data as unknown as DbPortfolioSnapshot[] || [];
    
    if (snapshotsData.length === 0) {
      return NextResponse.json({ error: 'No snapshots found' }, { status: 404 });
    }
    
    const snapshotList: PortfolioSnapshot[] = snapshotsData.map(snap => ({
      date: new Date(snap.created_at).toISOString().split('T')[0],
      total_value: parseFloat(String(snap.total_value)),
      cash_balance: parseFloat(String(snap.cash_balance)),
      equity_value: parseFloat(String(snap.equity_value)),
    }));
    
    const firstValue = parseFloat(String(snapshotsData[0].total_value));
    const lastValue = parseFloat(String(snapshotsData[snapshotsData.length - 1].total_value));
    const totalReturnPct = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
    
    const response: PortfolioValueHistory = {
      snapshots: snapshotList,
      latest_snapshot_date: snapshotsData[snapshotsData.length - 1].created_at,
      total_return_pct: totalReturnPct,
      days_tracked: snapshotList.length,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in portfolio/value-history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
