from textwrap import dedent
from typing import List, Dict, Tuple


SYSTEM_PROMPT = dedent("""
You are a conservative institutional equity research assistant.

Your objective is rational decision-making — not prediction.

CAPITAL PRESERVATION > OPPORTUNITY.

RULES:
- Output ONLY valid JSON.
- Only recommend BUY, SELL, or HOLD.
- Select AT MOST TWO BUY decisions per analysis.
- Prefer HOLD when signals are mixed.
- Do not hallucinate information.
- Use ONLY the provided structured data.
- Think like a portfolio manager — make informed decisions.

POSITION SIZING RULES:
- Consider portfolio balance and diversification
- Quantity should be realistic relative to stock price and available cash
- You have full discretion over position sizes
- Consider risk-reward ratio when determining quantities

PORTFOLIO MANAGEMENT RULES:
- For profitable positions (>10% gain): Consider taking partial profits
- For losing positions (<-10% loss): Evaluate if fundamentals support holding
- For concentrated positions (>25% of portfolio): Consider reducing exposure
- For new positions: Size appropriately based on conviction and available capital

CONFIDENCE SCALE:
0.5–0.6 → weak  
0.6–0.75 → moderate  
0.75+ → strong
""")


def _compute_momentum_label(change: float) -> str:
    if change > 3:
        return "STRONG_UP"
    if change > 1:
        return "UP"
    if change < -3:
        return "STRONG_DOWN"
    if change < -1:
        return "DOWN"
    return "NEUTRAL"


def _format_news(news_items: List[Dict]) -> str:
    if not news_items:
        return "<no_news>No reliable recent news.</no_news>"

    articles = "\n".join(
        dedent(f"""
        <article>
            <headline>{item.get("title", "No headline")}</headline>
            <date>{item.get("published_at", "Recent")}</date>
        </article>
        """).strip()
        for item in news_items[:3]
    )

    return dedent(f"""
    <news_summary>
        <article_count>{len(news_items)}</article_count>
    </news_summary>
    {articles}
    """)


def _format_stock(stock: Dict) -> str:
    momentum = _compute_momentum_label(stock["daily_change_pct"])

    trend = (
        "UP"
        if stock["current_price"] > stock["prev_close"]
        else "DOWN"
    )

    news_block = _format_news(stock.get("news", []))

    return dedent(f"""
    <stock>
        <symbol>{stock['symbol']}</symbol>

        <price_data>
            <current_price>{stock['current_price']}</current_price>
            <daily_change_pct>{stock['daily_change_pct']}</daily_change_pct>
            <momentum>{momentum}</momentum>
            <trend>{trend}</trend>
            <volume>{stock['volume']}</volume>
        </price_data>

        <trend_context>
            <yesterday_close>{stock['prev_close']}</yesterday_close>
            <day_before_close>{stock['prev_prev_close']}</day_before_close>
        </trend_context>

        <news_context>
            {news_block}
        </news_context>

    </stock>
    """)


def _get_performance_indicator(pnl_pct: float) -> str:
    """Get visual indicator for position performance"""
    if pnl_pct > 10:
        return "🚀"  # Strong gains
    elif pnl_pct > 5:
        return "📈"  # Good gains
    elif pnl_pct > 0:
        return "✅"  # Small gains
    elif pnl_pct > -5:
        return "➡️"  # Small loss
    elif pnl_pct > -10:
        return "📉"  # Moderate loss
    else:
        return "🔻"  # Significant loss


def _get_risk_assessment(holding: Dict, total_portfolio_value: float) -> str:
    """Assess risk level of a position"""
    current_value = holding.get('current_value', 0)
    portfolio_weight = (current_value / total_portfolio_value * 100) if total_portfolio_value > 0 else 0
    pnl_pct = holding.get('unrealized_pnl_pct', 0)
    days_held = holding.get('days_held', 0)
    
    risk_factors = []
    
    # Concentration risk
    if portfolio_weight > 20:
        risk_factors.append("HIGH_CONCENTRATION")
    elif portfolio_weight > 15:
        risk_factors.append("MODERATE_CONCENTRATION")
    
    # Performance risk
    if pnl_pct < -15:
        risk_factors.append("SIGNIFICANT_LOSS")
    elif pnl_pct < -10:
        risk_factors.append("MODERATE_LOSS")
    elif pnl_pct > 20:
        risk_factors.append("TAKE_PROFIT_CANDIDATE")
    elif pnl_pct > 10:
        risk_factors.append("PROFIT_TAKING_ZONE")
    
    # Time risk
    if days_held and days_held > 90:
        risk_factors.append("LONG_TERM_HOLD")
    elif days_held and days_held < 7:
        risk_factors.append("RECENT_PURCHASE")
    
    return ", ".join(risk_factors) if risk_factors else "NORMAL_RISK"


def _format_holdings(holdings: List[Dict], total_portfolio_value: float) -> str:
    """Format holdings with comprehensive P&L and risk context"""
    if not holdings:
        return "No current positions (100% Cash)."
    
    formatted_holdings = []
    
    for h in holdings:
        # Calculate portfolio weight
        current_value = h.get('current_value', 0)
        portfolio_weight = (current_value / total_portfolio_value * 100) if total_portfolio_value > 0 else 0
        
        # Get performance indicators
        pnl_pct = h.get('unrealized_pnl_pct', 0)
        performance_indicator = _get_performance_indicator(pnl_pct)
        risk_assessment = _get_risk_assessment(h, total_portfolio_value)
        
        # Format holding information
        holding_info = dedent(f"""
        {performance_indicator} {h['symbol']}: {h['quantity']} shares
          • Cost Basis: ₹{h['avg_price']:,.2f} per share (Total: ₹{h.get('cost_basis', 0):,.0f})
          • Current Price: ₹{h.get('current_price', h['avg_price']):,.2f}
          • Current Value: ₹{current_value:,.0f}
          • Unrealized P&L: ₹{h.get('unrealized_pnl', 0):,.0f} ({pnl_pct:+.1f}%)
          • Days Held: {h.get('days_held', 'Unknown')}
          • Portfolio Weight: {portfolio_weight:.1f}%
          • Risk Assessment: {risk_assessment}
        """).strip()
        
        formatted_holdings.append(holding_info)
    
    return "\n\n".join(formatted_holdings)


def _get_portfolio_health_assessment(state: Dict) -> str:
    """Assess overall portfolio health and provide guidance"""
    holdings = state.get('holdings', [])
    total_value = state.get('total_value', 0)
    cash_pct = (state.get('cash_balance', 0) / total_value * 100) if total_value > 0 else 100
    equity_pct = (state.get('equity_value', 0) / total_value * 100) if total_value > 0 else 0
    unrealized_pnl_pct = state.get('unrealized_pnl_pct', 0)
    
    assessments = []
    
    # Cash allocation assessment
    if cash_pct > 80:
        assessments.append("HIGH_CASH - Good opportunity to deploy capital selectively")
    elif cash_pct > 50:
        assessments.append("MODERATE_CASH - Balanced approach, selective buying")
    elif cash_pct < 20:
        assessments.append("LOW_CASH - Focus on position management, limited new buying")
    
    # Diversification assessment
    position_count = len(holdings)
    if position_count == 0:
        assessments.append("NO_POSITIONS - Start building core positions")
    elif position_count < 3:
        assessments.append("UNDER_DIVERSIFIED - Consider adding more positions")
    elif position_count > 10:
        assessments.append("OVER_DIVERSIFIED - Consider consolidating best positions")
    else:
        assessments.append("WELL_DIVERSIFIED - Good position count")
    
    # Performance assessment
    if unrealized_pnl_pct > 10:
        assessments.append("STRONG_PERFORMANCE - Consider taking some profits")
    elif unrealized_pnl_pct > 5:
        assessments.append("GOOD_PERFORMANCE - Portfolio trending well")
    elif unrealized_pnl_pct < -10:
        assessments.append("UNDERPERFORMING - Review losing positions")
    elif unrealized_pnl_pct < -5:
        assessments.append("SLIGHT_UNDERPERFORMANCE - Monitor closely")
    
    # Concentration risk
    if holdings:
        max_weight = max((h.get('current_value', 0) / total_value * 100) for h in holdings) if total_value > 0 else 0
        if max_weight > 25:
            assessments.append("HIGH_CONCENTRATION_RISK - Largest position is too big")
        elif max_weight > 20:
            assessments.append("MODERATE_CONCENTRATION_RISK - Monitor largest position")
    
    return " | ".join(assessments)


def build_prompts(state: Dict, candidates: List[Dict]) -> Tuple[str, str]:
    """Build enhanced prompts with comprehensive portfolio context"""
    
    # 1. Format the Candidate XML
    stocks_xml = "\n".join(_format_stock(stock) for stock in candidates)

    # 2. Extract and format the Current Holdings with P&L context
    holdings = state.get("holdings", [])
    total_portfolio_value = state.get('total_value', 0)
    holdings_formatted = _format_holdings(holdings, total_portfolio_value)
    
    # 3. Get portfolio health assessment
    portfolio_health = _get_portfolio_health_assessment(state)
    
    # 4. Calculate allocation percentages
    cash_pct = (state.get('cash_balance', 0) / total_portfolio_value * 100) if total_portfolio_value > 0 else 100
    equity_pct = (state.get('equity_value', 0) / total_portfolio_value * 100) if total_portfolio_value > 0 else 0
    
    # 5. Build the enhanced User Prompt
    user_prompt = dedent(f"""
    [PORTFOLIO CONTEXT]
    💰 Cash Balance: ₹{state.get('cash_balance', 0):,.0f} ({cash_pct:.1f}%)
    📊 Equity Value: ₹{state.get('equity_value', 0):,.0f} ({equity_pct:.1f}%) [Current Market Value]
    💵 Cost Basis: ₹{state.get('cost_basis', 0):,.0f} [What We Originally Paid]
    🏦 Total Portfolio Value: ₹{total_portfolio_value:,.0f}
    📈 Unrealized P&L: ₹{state.get('unrealized_pnl', 0):,.0f} ({state.get('unrealized_pnl_pct', 0):+.1f}%)
    
    [PORTFOLIO HEALTH ASSESSMENT]
    {portfolio_health}

    [CURRENT HOLDINGS WITH P&L ANALYSIS]
    {holdings_formatted}

    [CANDIDATE STOCKS FOR ANALYSIS]
    The following NIFTY 50 candidates have been pre-filtered based on market activity:
    <candidates>
    {stocks_xml}
    </candidates>

    [DECISION FRAMEWORK]
    🎯 Position Sizing: You have ₹{state.get('cash_balance', 0):,.0f} available cash - use your judgment
    🛡️ Risk Management: Capital preservation is priority #1
    📊 Portfolio Strategy: 
        • For existing profitable positions (>10% gain): Consider taking partial profits
        • For existing losing positions (<-10% loss): Evaluate if fundamentals justify holding
        • For concentrated positions (>25% weight): Consider reducing exposure
        • For new positions: Size based on conviction and available capital
    
    🔍 Decision Logic:
        • BUY: Strong fundamentals + good entry point + sufficient capital
        • SELL: Deteriorating fundamentals OR take profits OR reduce concentration
        • HOLD: Mixed signals OR position is performing as expected
    
    ⚠️ Constraints:
        • Maximum 2 BUY decisions per analysis
        • Must output ONLY valid JSON
        • Quantity must be realistic relative to stock price and available cash
        • Consider existing position when evaluating same stock

    [REQUIRED OUTPUT FORMAT]
    {{
      "decisions": [
        {{
          "symbol": "SYMBOL",
          "action": "BUY/SELL/HOLD",
          "confidence": float,
          "quantity": int,
          "reasoning": "Detailed explanation considering current portfolio context, P&L, and market conditions"
        }}
      ]
    }}
    """)

    return SYSTEM_PROMPT, user_prompt