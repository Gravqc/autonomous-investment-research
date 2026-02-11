import yfinance as yf
import pandas as pd
from typing import List, Dict, Any

class MarketDataClient:
    @staticmethod
    def get_market_snapshot(symbols: List[str]) -> List[Dict[str, Any]]:
        """
        Fetches the last 3 trading days of data for the given symbols.
        Returns a snapshot including Today, Yesterday, and Day-Before metrics.
        """
        # 1. Add .NS suffix for NSE India
        tickers = [f"{s}.NS" for s in symbols]
        
        # 2. Batch Download
        # We fetch "4d" to safely get 3 valid trading rows
        print(f"Fetching 3-day history for {len(tickers)} symbols...")
        try:
            data = yf.download(
                tickers, 
                period="4d", 
                group_by='ticker', 
                threads=True,
                progress=False
            )
        except Exception as e:
            print(f"Critical Error downloading market data: {e}")
            return []
        
        snapshot = []
        
        for symbol in symbols:
            ticker_key = f"{symbol}.NS"
            try:
                # 3. Extract DataFrame for this ticker
                # .tail(3) gives us [Day-Before, Yesterday, Today]
                df = data[ticker_key].dropna().tail(3)
                
                # Safety Check: Need at least 3 rows to calculate 3-day context
                if len(df) < 3:
                    print(f"Insufficient data for {symbol} (rows={len(df)}), skipping...")
                    continue

                # 4. Extract Data Points
                # Row -1 = Today (Current)
                # Row -2 = Yesterday
                # Row -3 = Day Before Yesterday
                
                curr_row = df.iloc[-1]
                prev_row = df.iloc[-2]
                prev_prev_row = df.iloc[-3]

                current_close = float(curr_row['Close'])
                prev_close = float(prev_row['Close'])
                
                # Calculate Daily Change % ((New - Old) / Old) * 100
                daily_change_pct = ((current_close - prev_close) / prev_close) * 100

                snapshot.append({
                    "symbol": symbol,
                    # --- Critical Signals ---
                    "current_price": current_close,
                    "daily_change_pct": round(daily_change_pct, 2),
                    "volume": int(curr_row['Volume']),
                    
                    # --- Today's Candle ---
                    "open": float(curr_row['Open']),
                    "high": float(curr_row['High']),
                    "low": float(curr_row['Low']),
                    
                    # --- Yesterday's Context (Trend Check) ---
                    "prev_close": prev_close,
                    "prev_open": float(prev_row['Open']),
                    
                    # --- Day Before Context (Reversal Check) ---
                    "prev_prev_close": float(prev_prev_row['Close']),
                    "prev_prev_open": float(prev_prev_row['Open']),
                })
                
            except KeyError:
                print(f"Data missing for {symbol}")
                continue
            except Exception as e:
                print(f"Error processing {symbol}: {e}")
                continue
                
        print(f"Successfully captured snapshot for {len(snapshot)} symbols.")
        return snapshot

    def filter_candidates(market_snapshot: List[Dict[str, Any]], min_change_pct: float = 1.5, top_n: int = 10) -> List[Dict[str, Any]]:
        print(f"Filtering {len(market_snapshot)} stocks. Criteria: >{min_change_pct}% move.")
    
        candidates = []
        for stock in market_snapshot:
            # We care about big moves UP or DOWN (Volatility = Opportunity)
            if abs(stock['daily_change_pct']) >= min_change_pct:
                candidates.append(stock)
                
        # Sort by absolute change descending (Biggest movers at the top)
        candidates.sort(key=lambda x: abs(x['daily_change_pct']), reverse=True)
        
        # Cap the list to avoid over-processing
        final_list = candidates[:top_n]
        
        # Log results for debugging
        print(f"Found {len(candidates)} active movers. Returning Top {len(final_list)}.")
        for c in final_list:
            print(f"-> {c['symbol']}: {c['daily_change_pct']}% | Price: {c['current_price']}")
            
        return final_list