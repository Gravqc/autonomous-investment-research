from collections import defaultdict
from datetime import datetime
from investment_engine.db.models import PositionSnapshot
from sqlalchemy import select, func

from investment_engine.workflows.utils.type_conversion import to_decimal

from investment_engine.db.session import session_scope
from investment_engine.db.models.trades import Trade
from investment_engine.db.models.portfolio_snapshots import PortfolioSnapshot


class SnapshotService:
    @staticmethod
    def create(portfolio_id, price_lookup):
        decimal_prices = {k: to_decimal(v) for k, v in price_lookup.items()}

        with session_scope() as session:
            # Get the latest snapshot
            latest_snapshot = (
                session.query(PortfolioSnapshot)
                .filter(PortfolioSnapshot.portfolio_id == portfolio_id)
                .order_by(PortfolioSnapshot.created_at.desc())
                .first()
            )

            if not latest_snapshot:
                raise RuntimeError("No initial snapshot found. Seed the portfolio first.")

            # ✅ FIX: Only get trades AFTER the latest snapshot
            trades_since_snapshot = (
                session.query(Trade)
                .filter(
                    Trade.portfolio_id == portfolio_id,
                    Trade.executed_at > latest_snapshot.created_at
                )
                .all()
            )

            # Start with the latest snapshot's cash balance
            cash = latest_snapshot.cash_balance

            # Get existing positions from the latest snapshot
            existing_positions = (
                session.query(PositionSnapshot)
                .filter(PositionSnapshot.snapshot_id == latest_snapshot.id)
                .all()
            )

            # Initialize positions with existing holdings
            positions = defaultdict(lambda: {"qty": 0, "cost": 0})
            for pos in existing_positions:
                positions[pos.symbol]["qty"] = pos.quantity
                positions[pos.symbol]["cost"] = pos.quantity * pos.avg_price

            # ✅ FIX: Only process NEW trades since last snapshot
            for t in trades_since_snapshot:
                if t.side == "BUY":
                    trade_value = t.quantity * t.price
                    positions[t.symbol]["qty"] += t.quantity
                    positions[t.symbol]["cost"] += trade_value
                    cash -= trade_value

                elif t.side == "SELL":
                    # For sells, we need to calculate based on current position
                    current_qty = positions[t.symbol]["qty"]
                    if current_qty >= t.quantity:
                        # Partial or full sell
                        avg_cost = positions[t.symbol]["cost"] / current_qty if current_qty > 0 else 0
                        cost_reduction = t.quantity * avg_cost
                        
                        positions[t.symbol]["qty"] -= t.quantity
                        positions[t.symbol]["cost"] -= cost_reduction
                        
                        # Add proceeds to cash
                        trade_value = t.quantity * t.price
                        cash += trade_value
                    else:
                        # Selling more than we have - this shouldn't happen with proper validation
                        print(f"Warning: Trying to sell {t.quantity} {t.symbol} but only have {current_qty}")

            # Calculate equity value using current market prices
            equity_value = 0
            snapshot = PortfolioSnapshot(
                portfolio_id=portfolio_id,
                cash_balance=cash,
                equity_value=0,  # fill after computing
                total_value=0,
                created_at=datetime.utcnow(),
            )

            session.add(snapshot)
            session.flush()

            # Create position snapshots
            for symbol, pos in positions.items():
                if pos["qty"] <= 0:
                    continue

                # Use current market price for valuation
                current_price = decimal_prices.get(symbol, 0)
                market_value = pos["qty"] * current_price
                equity_value += market_value

                # Calculate average cost basis
                avg_price = pos["cost"] / pos["qty"] if pos["qty"] > 0 else 0

                position = PositionSnapshot(
                    snapshot_id=snapshot.id,
                    symbol=symbol,
                    quantity=pos["qty"],
                    avg_price=avg_price,
                )

                session.add(position)

            # Update snapshot with calculated values
            snapshot.equity_value = equity_value
            snapshot.total_value = equity_value + cash