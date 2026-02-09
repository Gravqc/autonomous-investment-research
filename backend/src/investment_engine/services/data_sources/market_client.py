import yfinance as yf


class MarketDataClient:

    @staticmethod
    def get_latest_price(symbol: str) -> float:
        ticker = yf.Ticker(f"{symbol}.NS")
        data = ticker.history(period="1d")

        return float(data["Close"].iloc[-1])


    @staticmethod
    def get_prices(symbols: list[str]) -> dict[str, float]:

        prices = {}

        for symbol in symbols:
            prices[symbol] = MarketDataClient.get_latest_price(symbol)

        return prices
