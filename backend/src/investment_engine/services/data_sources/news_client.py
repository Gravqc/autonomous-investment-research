import requests
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

class MarketAuxClient:
    
    def __init__(self, api_key: str, base_url: str ):
        self.api_key = api_key
        self.base_url = base_url
        if not self.api_key or not self.base_url:
            raise ValueError("MARKET_AUX_API_KEY/ MARKET_AUX_BASE_URL is not set.")

    def enrich_stock_candidates(self, candidates: List[Dict[str, Any]]):
        enriched_list = []
    
        for stock in candidates:
            symbol = stock['symbol']
            
            # 2. Fetch News (IO Bound)
            try:
                news_items = self.get_stock_news(symbol, limit=3)
            except Exception as e:
                #logger.error(f"Failed to fetch news for {symbol}: {e}")
                news_items = []

            # 3. Create a clean copy to avoid mutating the input directly
            enriched_stock = stock.copy()
            
            # 4. Attach the Context
            enriched_stock['news'] = news_items
            
            # 5. Add a metadata flag for the Decision Engine
            # This helps the LLM know if it's flying blind or has data.
            if news_items:
                enriched_stock['has_news_context'] = True
                #logger.info(f"Found {len(news_items)} articles for {symbol}")
            else:
                enriched_stock['has_news_context'] = False
                #logger.warning(f"No news found for {symbol}")
                
            enriched_list.append(enriched_stock)
            
        return enriched_list

    def get_stock_news(self, symbol: str, limit: int = 3) -> List[Dict[str, Any]]:
        """
        Fetches the latest news for a specific stock symbol.
        """
        endpoint = f"{self.base_url}/news/all"
        
        # 2. Constructing the Parameters
        # Marketaux uses the '.NS' suffix for NSE stocks, but verify if they need it.
        # Usually, standard tickers 'RELIANCE' work, but 'RELIANCE.NS' is safer for India context.
        query_symbol = f"{symbol}.NS" if not symbol.endswith(".NS") else symbol

        # We only want to look for recent articles
        lookback_window = datetime.now() - timedelta(days=14)
        published_after = lookback_window.strftime('%Y-%m-%dT%H:%M')

        params = {
            "api_token": self.api_key,
            "symbols": query_symbol,
            "filter_entities": "true", # Only return news definitely about this entity
            "limit": limit,            # Free tier max is 3
            "language": "en",          # English only
            "countries": "in",         # Country to search for 
            "published_after": published_after, # Weak filter (14 days)
            # "min_match_score": 50,     # Optional: Strictness of match (avoid loose mentions)
        }

        try:
            print(f"Fetching news for {symbol}...")
            response = requests.get(endpoint, params=params, timeout=10)
            
            # 3. Handle HTTP Errors (401, 429, 500)
            if response.status_code == 429:
                print(f"RATE LIMIT EXCEEDED. Stopping news fetch for {symbol}.")
                return []
            
            response.raise_for_status()
            
            data = response.json()
            articles = data.get("data", [])
            
            # 4. Clean and Format the Response
            cleaned_news = []
            for item in articles:
                cleaned_news.append({
                    "title": item.get("title"),
                    "description": item.get("description"),
                    "url": item.get("url"),
                    "published_at": item.get("published_at"),
                    "source": item.get("source"),
                })
                
            return cleaned_news

        except requests.exceptions.RequestException as e:
            print(f"Error fetching news for {symbol}: {e}")
            return []