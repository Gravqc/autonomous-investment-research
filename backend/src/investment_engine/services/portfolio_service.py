from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy import select, desc, func

from investment_engine.db.session import session_scope
from investment_engine.db.models.portfolios import Portfolio
from investment_engine.db.models.portfolio_snapshots import PortfolioSnapshot
from investment_engine.db.models.position_snapshots import PositionSnapshot
from investment_engine.schemas.portfolio import (
    PortfolioState, 
    Position, 
    PortfolioValueHistory, 
    PortfolioSnapshot as PortfolioSnapshotSchema,
    PerformanceMetrics
)


class PortfolioService:
    
    @staticmethod
    def build_state():
        """
        Returns the latest portfolio state:
        - cash
        - equity
        - holdings
        """
        with session_scope() as session:
            portfolio = session.query(Portfolio).first()

            latest_snapshot = (
                session.query(PortfolioSnapshot)
                .filter(PortfolioSnapshot.portfolio_id == portfolio.id)
                .order_by(PortfolioSnapshot.created_at.desc())
                .first()
            )

            positions = (
                session.query(PositionSnapshot)
                .filter(PositionSnapshot.snapshot_id == latest_snapshot.id)
                .all()
            )

            holdings = [
                {
                    "symbol": p.symbol,
                    "quantity": p.quantity,
                    "avg_price": float(p.avg_price),
                }
                for p in positions
            ]

            return {
                "portfolio_id": portfolio.id,
                "cash_balance": float(latest_snapshot.cash_balance),
                "equity_value": float(latest_snapshot.equity_value),
                "total_value": float(latest_snapshot.total_value),
                "holdings": holdings,
            }

    @staticmethod
    def get_current_portfolio_state(portfolio_id: Optional[int] = None) -> PortfolioState:
        """Get the current portfolio state with positions"""
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

            position_list = [
                Position(
                    symbol=pos.symbol,
                    quantity=float(pos.quantity),
                    avg_price=float(pos.avg_price),
                    current_value=float(pos.quantity * pos.avg_price)
                )
                for pos in positions
            ]

            return PortfolioState(
                portfolio_id=portfolio_id,
                current_value=float(latest_snapshot.total_value),
                cash_balance=float(latest_snapshot.cash_balance),
                equity_value=float(latest_snapshot.equity_value),
                snapshot_date=latest_snapshot.created_at,
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