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


def build_prompts(candidates: List[Dict]) -> Tuple[str, str]:

    stocks_xml = "\n".join(_format_stock(stock) for stock in candidates)

    user_prompt = dedent(f"""
    The following stocks were pre-filtered from the NIFTY 50 universe
    based on abnormal trading activity and recent news attention.

    Evaluate ONLY these candidates.

    Portfolio Constraints:
    - Capital is limited.
    - Select at most TWO BUY decisions.
    - If uncertain, prefer HOLD.

    Avoid:
    - chasing large price spikes
    - reacting to duplicate headlines
    - over-trading

    ===== CANDIDATE STOCKS =====
    <candidates>
    {stocks_xml}
    </candidates>
    ===== END =====

    Return ONLY valid JSON in this format:

    {{
      "decisions": [
        {{
          "symbol": "Stock_Symbol",
          "action": "BUY/SELL/HOLD",
          "confidence": conf_score,
          "reasoning": "Short explanation."
        }}
      ]
    }}
    """)

    return SYSTEM_PROMPT, user_prompt
