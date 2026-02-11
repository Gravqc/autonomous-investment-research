from textwrap import dedent
from typing import List, Dict, Tuple


SYSTEM_PROMPT = dedent("""
You are a conservative institutional equity research assistant.

Your objective is rational decision-making — not prediction.

CAPITAL PRESERVATION > OPPORTUNITY.

RULES:
- Output ONLY valid JSON.
- Only recommend BUY, SELL, or HOLD.
- Select AT MOST TWO BUY decisions.
- Prefer HOLD when signals are mixed.
- Do not hallucinate information.
- Use ONLY the provided structured data.
- Think like a portfolio manager — capital is limited.

POSITION SIZING RULES:

- Never allocate more than 20% of available cash to a single position.
- Prefer smaller sizing when confidence is moderate.
- Quantity must be realistic relative to price.
- If unsure → choose smaller size.


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


def build_prompts(state: Dict, candidates: List[Dict]) -> Tuple[str, str]:
    # 1. Format the Candidate XML
    stocks_xml = "\n".join(_format_stock(stock) for stock in candidates)

    # 2. Extract and format the Current Holdings list
    holdings = state.get("holdings", [])
    if holdings:
        holdings_formatted = "\n".join(
            f"- {h['symbol']}: {h['quantity']} shares (Avg Price: {h['avg_price']})"
            for h in holdings
        )
    else:
        holdings_formatted = "No current positions (100% Cash)."

    # 3. Build the User Prompt with the State Context
    user_prompt = dedent(f"""
    [PORTFOLIO CONTEXT]
    - Cash Balance: {state['cash_balance']}
    - Equity Value: {state['equity_value']}
    - Total Portfolio Value: {state['total_value']}
    
    Current Holdings:
    {holdings_formatted}

    [CANDIDATE STOCKS]
    The following NIFTY 50 candidates have been pre-filtered for analysis:
    <candidates>
    {stocks_xml}
    </candidates>

    [DECISION REQUIREMENTS]
    - Position Sizing: Max 20% of cash per buy (${state['cash_balance'] * 0.20:,.2f}).
    - Portfolio Strategy: Capital preservation. If you hold a candidate and signals are mixed, recommend HOLD.
    - Output: ONLY valid JSON.

    Return in this format:
    {{
      "decisions": [
        {{
          "symbol": "SYMBOL",
          "action": "BUY/SELL/HOLD",
          "confidence": float,
          "quantity": int,
          "reasoning": "string"
        }}
      ]
    }}
    """)

    return SYSTEM_PROMPT, user_prompt