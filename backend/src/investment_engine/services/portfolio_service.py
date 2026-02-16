from datetime import datetime, timedelta
from typing import List, Optional, Dict
from sqlalchemy import select, desc, func

from investment_engine.db.session import session_scope
from investment_engine.db.models.portfolios import Portfolio
from investment_engine.db.models.portfolio_snapshots import PortfolioSnapshot
from investment_engine.db.models.position_snapshots import PositionSnapshot
from investment_engine.db.models.trades import Trade
from investment_engine.schemas.portfolio import (
    PortfolioState, 
    Position, 
    PortfolioValueHistory, 
    PortfolioSnapshot as PortfolioSnapshotSchema,
    PerformanceMetrics
)


class PortfolioService:
    
    @staticmethod
    def build_state(current_prices: Optional[Dict[str, float]] = None):
        """
        Build portfolio state with real-time market valuation
        
        Args:
            current_prices: dict of {symbol: current_price} from market data
                          If None, falls back to cost basis for backward compatibility
        
        Returns:
            dict: Portfolio state with current market values and unrealized P&L
        """
        with session_scope() as session:
            portfolio = session.query(Portfolio).first()
            if not portfolio:
                raise ValueError("No portfolio found")

            # Get latest snapshot for cash balance and position quantities
            latest_snapshot = (
                session.query(PortfolioSnapshot)
                .filter(PortfolioSnapshot.portfolio_id == portfolio.id)
                .order_by(PortfolioSnapshot.created_at.desc())
                .first()
            )

            if not latest_snapshot:
                raise ValueError("No snapshots found - portfolio needs to be seeded")

            # Get positions from latest snapshot
            positions = (
                session.query(PositionSnapshot)
                .filter(PositionSnapshot.snapshot_id == latest_snapshot.id)
                .all()
            )

            # Calculate current equity value and build holdings
            current_equity_value = 0
            total_cost_basis = 0
            holdings = []

            for p in positions:
                # Use current market price if available, otherwise fall back to avg_price
                current_price = current_prices.get(p.symbol, float(p.avg_price)) if current_prices else float(p.avg_price)
                
                quantity = float(p.quantity)
                avg_price = float(p.avg_price)
                
                current_value = quantity * current_price
                cost_basis = quantity * avg_price
                unrealized_pnl = current_value - cost_basis
                unrealized_pnl_pct = (unrealized_pnl / cost_basis * 100) if cost_basis > 0 else 0

                # Calculate days held (approximate - from first trade of this symbol)
                days_held = None
                try:
                    first_trade = (
                        session.query(Trade)
                        .filter(
                            Trade.portfolio_id == portfolio.id,
                            Trade.symbol == p.symbol,
                            Trade.side == "BUY"
                        )
                        .order_by(Trade.executed_at.asc())
                        .first()
                    )
                    if first_trade:
                        days_held = (datetime.utcnow() - first_trade.executed_at).days
                except Exception:
                    pass  # If calculation fails, leave as None

                current_equity_value += current_value
                total_cost_basis += cost_basis

                holdings.append({
                    "symbol": p.symbol,
                    "quantity": quantity,
                    "avg_price": avg_price,
                    "current_price": current_price,
                    "current_value": current_value,
                    "cost_basis": cost_basis,
                    "unrealized_pnl": unrealized_pnl,
                    "unrealized_pnl_pct": unrealized_pnl_pct,
                    "days_held": days_held,
                })

            cash_balance = float(latest_snapshot.cash_balance)
            total_portfolio_value = current_equity_value + cash_balance
            total_unrealized_pnl = current_equity_value - total_cost_basis
            total_unrealized_pnl_pct = (total_unrealized_pnl / total_cost_basis * 100) if total_cost_basis > 0 else 0

            return {
                "portfolio_id": portfolio.id,
                "cash_balance": cash_balance,
                "equity_value": current_equity_value,
                "cost_basis": total_cost_basis,
                "total_value": total_portfolio_value,
                "unrealized_pnl": total_unrealized_pnl,
                "unrealized_pnl_pct": total_unrealized_pnl_pct,
                "holdings": holdings,
                "snapshot_date": latest_snapshot.created_at,
                "market_data_timestamp": datetime.utcnow() if current_prices else None,
            }

    @staticmethod
    def get_current_portfolio_state(portfolio_id: Optional[int] = None, current_prices: Optional[Dict[str, float]] = None) -> PortfolioState:
        """Get the current portfolio state with real-time market valuation"""
        with session_scope() as session:
            # Get the first portfolio if no ID specified
            if portfolio_id is None:
                portfolio = session.query(Portfolio).first()
                if not portfolio:
                    raise ValueError("No portfolio found")
                portfolio_id = portfolio.id

            # Get latest snapshot
            latest_snapshot = (
                session.query(PortfolioSnapshot)
                .filter(PortfolioSnapshot.portfolio_id == portfolio_id)
                .order_by(PortfolioSnapshot.created_at.desc())
                .first()
            )

            if not latest_snapshot:
                raise ValueError(f"No snapshots found for portfolio {portfolio_id}")

            # Get positions for this snapshot
            positions = (
                session.query(PositionSnapshot)
                .filter(PositionSnapshot.snapshot_id == latest_snapshot.id)
                .all()
            )

            # Calculate real-time values
            current_equity_value = 0
            total_cost_basis = 0
            position_list = []

            for pos in positions:
                # Use current market price if available, otherwise fall back to avg_price
                current_price = current_prices.get(pos.symbol, float(pos.avg_price)) if current_prices else float(pos.avg_price)
                
                quantity = float(pos.quantity)
                avg_price = float(pos.avg_price)
                
                current_value = quantity * current_price
                cost_basis = quantity * avg_price
                unrealized_pnl = current_value - cost_basis
                unrealized_pnl_pct = (unrealized_pnl / cost_basis * 100) if cost_basis > 0 else 0

                # Calculate days held
                days_held = None
                try:
                    first_trade = (
                        session.query(Trade)
                        .filter(
                            Trade.portfolio_id == portfolio_id,
                            Trade.symbol == pos.symbol,
                            Trade.side == "BUY"
                        )
                        .order_by(Trade.executed_at.asc())
                        .first()
                    )
                    if first_trade:
                        days_held = (datetime.utcnow() - first_trade.executed_at).days
                except Exception:
                    pass

                current_equity_value += current_value
                total_cost_basis += cost_basis

                position_list.append(Position(
                    symbol=pos.symbol,
                    quantity=quantity,
                    avg_price=avg_price,
                    current_price=current_price,
                    current_value=current_value,
                    cost_basis=cost_basis,
                    unrealized_pnl=unrealized_pnl,
                    unrealized_pnl_pct=unrealized_pnl_pct,
                    days_held=days_held
                ))

            cash_balance = float(latest_snapshot.cash_balance)
            total_portfolio_value = current_equity_value + cash_balance
            total_unrealized_pnl = current_equity_value - total_cost_basis
            total_unrealized_pnl_pct = (total_unrealized_pnl / total_cost_basis * 100) if total_cost_basis > 0 else 0

            return PortfolioState(
                portfolio_id=portfolio_id,
                current_value=total_portfolio_value,
                cash_balance=cash_balance,
                equity_value=current_equity_value,
                cost_basis=total_cost_basis,
                unrealized_pnl=total_unrealized_pnl,
                unrealized_pnl_pct=total_unrealized_pnl_pct,
                snapshot_date=latest_snapshot.created_at,
                market_data_timestamp=datetime.utcnow() if current_prices else None,
                positions=position_list
            )

    @staticmethod
    def get_portfolio_value_history(days: int = 30, portfolio_id: Optional[int] = None) -> PortfolioValueHistory:
        """Get portfolio value history for the specified number of days"""
        with session_scope() as session:
            # Get the first portfolio if no ID specified
            if portfolio_id is None:
                portfolio = session.query(Portfolio).first()
                if not portfolio:
                    raise ValueError("No portfolio found")
                portfolio_id = portfolio.id

            # Calculate date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)

            # Get snapshots within date range
            snapshots = (
                session.query(PortfolioSnapshot)
                .filter(
                    PortfolioSnapshot.portfolio_id == portfolio_id,
                    PortfolioSnapshot.created_at >= start_date
                )
                .order_by(PortfolioSnapshot.created_at.asc())
                .all()
            )

            if not snapshots:
                raise ValueError(f"No snapshots found for portfolio {portfolio_id}")

            # Convert to schema objects
            snapshot_list = [
                PortfolioSnapshotSchema(
                    date=snap.created_at.strftime("%Y-%m-%d"),
                    total_value=float(snap.total_value),
                    cash_balance=float(snap.cash_balance),
                    equity_value=float(snap.equity_value)
                )
                for snap in snapshots
            ]

            # Calculate total return
            first_value = float(snapshots[0].total_value)
            last_value = float(snapshots[-1].total_value)
            total_return_pct = ((last_value - first_value) / first_value) * 100 if first_value > 0 else 0

            return PortfolioValueHistory(
                snapshots=snapshot_list,
                latest_snapshot_date=snapshots[-1].created_at,
                total_return_pct=total_return_pct,
                days_tracked=len(snapshots)
            )

    @staticmethod
    def get_portfolio_performance_metrics(portfolio_id: Optional[int] = None) -> PerformanceMetrics:
        """Calculate comprehensive performance metrics"""
        with session_scope() as session:
            # Get the first portfolio if no ID specified
            if portfolio_id is None:
                portfolio = session.query(Portfolio).first()
                if not portfolio:
                    raise ValueError("No portfolio found")
                portfolio_id = portfolio.id

            # Get all snapshots for this portfolio
            snapshots = (
                session.query(PortfolioSnapshot)
                .filter(PortfolioSnapshot.portfolio_id == portfolio_id)
                .order_by(PortfolioSnapshot.created_at.asc())
                .all()
            )

            if len(snapshots) < 2:
                raise ValueError("Need at least 2 snapshots to calculate performance")

            values = [float(snap.total_value) for snap in snapshots]
            starting_value = values[0]
            current_value = values[-1]

            # Calculate returns
            total_return_amount = current_value - starting_value
            total_return_pct = (total_return_amount / starting_value) * 100 if starting_value > 0 else 0

            # Calculate daily returns for drawdown and best/worst day
            daily_returns = []
            for i in range(1, len(values)):
                daily_return = ((values[i] - values[i-1]) / values[i-1]) * 100 if values[i-1] > 0 else 0
                daily_returns.append(daily_return)

            # Calculate maximum drawdown
            peak = starting_value
            max_drawdown = 0
            for value in values:
                if value > peak:
                    peak = value
                drawdown = ((peak - value) / peak) * 100 if peak > 0 else 0
                max_drawdown = max(max_drawdown, drawdown)

            return PerformanceMetrics(
                total_return_pct=total_return_pct,
                total_return_amount=total_return_amount,
                max_drawdown_pct=max_drawdown,
                days_tracked=len(snapshots),
                starting_value=starting_value,
                current_value=current_value,
                best_day_return=max(daily_returns) if daily_returns else 0,
                worst_day_return=min(daily_returns) if daily_returns else 0
            )