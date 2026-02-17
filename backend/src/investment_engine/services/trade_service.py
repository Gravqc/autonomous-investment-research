from datetime import datetime
from typing import List, Optional
import json

from investment_engine.db.session import session_scope
from investment_engine.db.models.trades import Trade
from investment_engine.db.models.portfolios import Portfolio
from investment_engine.schemas.trades import TradeRecord, RecentTrades


class TradeService:
    
    # Remove artificial limits - let AI decide
    MIN_CONFIDENCE = 0.50  # Lower threshold to respect AI decisions

    @staticmethod
    def execute(decision_rows, state, price_lookup):
        """
        Execute trades exactly as the AI decided, with proper cash management
        """
        with session_scope() as session:
            current_cash = float(state["cash_balance"])
            portfolio_id = state["portfolio_id"]

            for decision_row in decision_rows:
                try:
                    # Parse the decision data from raw_llm_output
                    decision_data = json.loads(decision_row.raw_llm_output)

                    symbol = decision_data["symbol"]
                    action = decision_data["action"].upper()
                    requested_qty = int(decision_data["quantity"])
                    confidence = float(decision_data["confidence"])

                    # Skip if confidence is too low
                    if confidence < TradeService.MIN_CONFIDENCE:
                        print(f" Skipping {symbol} - confidence {confidence:.2f} below threshold {TradeService.MIN_CONFIDENCE}")
                        continue

                    # Skip HOLD actions
                    if action == "HOLD":
                        print(f" Skipping {symbol} - HOLD action")
                        continue

                    # Get current market price
                    price = price_lookup.get(symbol)
                    if not price:
                        print(f"No price available for {symbol}, skipping")
                        continue

                    price = float(price)

                    if action == "BUY":
                        # Calculate total cost
                        total_cost = requested_qty * price

                        # Check if we have enough cash
                        if total_cost > current_cash:
                            print(f"Insufficient cash for {symbol}: need ₹{total_cost:,.2f}, have ₹{current_cash:,.2f}")
                            # Calculate maximum affordable quantity
                            max_affordable_qty = int(current_cash // price)
                            if max_affordable_qty > 0:
                                final_qty = max_affordable_qty
                                total_cost = final_qty * price
                                print(f"Reducing quantity to {final_qty} shares (₹{total_cost:,.2f})")
                            else:
                                print(f"Cannot afford any shares of {symbol}")
                                continue
                        else:
                            final_qty = requested_qty
                            print(f"Executing full order: {final_qty} shares for ₹{total_cost:,.2f}")

                        # Create and save the trade
                        trade = Trade(
                            portfolio_id=portfolio_id,
                            symbol=symbol,
                            side="BUY",
                            quantity=final_qty,
                            price=price,
                            total_value=total_cost,
                            executed_at=datetime.utcnow(),
                            decision_id=decision_row.id,
                        )

                        session.add(trade)
                        current_cash -= total_cost
                        print(f"Cash after trade: ₹{current_cash:,.2f}")

                    elif action == "SELL":
                        # For SELL orders, we need to check current positions
                        # This is more complex and would require position tracking
                        # For now, let's implement basic SELL logic
                        total_proceeds = requested_qty * price

                        trade = Trade(
                            portfolio_id=portfolio_id,
                            symbol=symbol,
                            side="SELL",
                            quantity=requested_qty,
                            price=price,
                            total_value=total_proceeds,
                            executed_at=datetime.utcnow(),
                            decision_id=decision_row.id,
                        )

                        session.add(trade)
                        current_cash += total_proceeds
                        print(f"Cash after sell: ₹{current_cash:,.2f}")

                except Exception as e:
                    print(f"❌ Error processing decision {decision_row.id}: {e}")
                    continue

            print(f"🏁 Trade execution complete. Final cash: ₹{current_cash:,.2f}")

    @staticmethod
    def get_recent_trades(limit: int = 20, portfolio_id: Optional[int] = None) -> RecentTrades:
        """Get recent trade executions"""
        with session_scope() as session:
            # Get the first portfolio if no ID specified
            if portfolio_id is None:
                portfolio = session.query(Portfolio).first()
                if not portfolio:
                    raise ValueError("No portfolio found")
                portfolio_id = portfolio.id

            trades = (
                session.query(Trade)
                .filter(Trade.portfolio_id == portfolio_id)
                .order_by(Trade.executed_at.desc())
                .limit(limit)
                .all()
            )

            # Get total count
            total_count = (
                session.query(Trade)
                .filter(Trade.portfolio_id == portfolio_id)
                .count()
            )

            trade_records = [
                TradeRecord(
                    trade_id=trade.id,
                    portfolio_id=trade.portfolio_id,
                    symbol=trade.symbol,
                    side=trade.side,
                    quantity=float(trade.quantity),
                    price=float(trade.price),
                    total_value=float(trade.total_value),
                    executed_at=trade.executed_at,
                    decision_id=trade.decision_id
                )
                for trade in trades
            ]

            return RecentTrades(
                trades=trade_records,
                total_trades=total_count
            )

    @staticmethod
    def get_trades_for_decision(decision_id: int) -> List[TradeRecord]:
        """Get all trades associated with a specific decision"""
        with session_scope() as session:
            trades = (
                session.query(Trade)
                .filter(Trade.decision_id == decision_id)
                .order_by(Trade.executed_at.desc())
                .all()
            )

            return [
                TradeRecord(
                    trade_id=trade.id,
                    portfolio_id=trade.portfolio_id,
                    symbol=trade.symbol,
                    side=trade.side,
                    quantity=float(trade.quantity),
                    price=float(trade.price),
                    total_value=float(trade.total_value),
                    executed_at=trade.executed_at,
                    decision_id=trade.decision_id
                )
                for trade in trades
            ]
