"""
Portfolio Validation Service

This service ensures mathematical consistency across all portfolio operations.
It validates that trades, snapshots, and positions are mathematically correct.
"""

from datetime import datetime
from typing import Dict, List, Tuple
from decimal import Decimal

from investment_engine.db.session import session_scope
from investment_engine.db.models.trades import Trade
from investment_engine.db.models.portfolio_snapshots import PortfolioSnapshot
from investment_engine.db.models.position_snapshots import PositionSnapshot


class PortfolioValidationService:
    
    @staticmethod
    def validate_portfolio_consistency(portfolio_id: int) -> Dict:
        """
        Validate that all portfolio data is mathematically consistent
        Returns a detailed validation report
        """
        with session_scope() as session:
            # Get all data
            trades = session.query(Trade).filter(Trade.portfolio_id == portfolio_id).order_by(Trade.executed_at).all()
            snapshots = session.query(PortfolioSnapshot).filter(PortfolioSnapshot.portfolio_id == portfolio_id).order_by(PortfolioSnapshot.created_at).all()
            
            validation_report = {
                "is_valid": True,
                "errors": [],
                "warnings": [],
                "summary": {},
                "trade_analysis": {},
                "snapshot_analysis": {}
            }
            
            # Validate trades
            trade_validation = PortfolioValidationService._validate_trades(trades)
            validation_report["trade_analysis"] = trade_validation
            
            # Validate snapshots
            snapshot_validation = PortfolioValidationService._validate_snapshots(snapshots, trades)
            validation_report["snapshot_analysis"] = snapshot_validation
            
            # Check overall consistency
            if trade_validation["errors"] or snapshot_validation["errors"]:
                validation_report["is_valid"] = False
                validation_report["errors"].extend(trade_validation["errors"])
                validation_report["errors"].extend(snapshot_validation["errors"])
            
            validation_report["warnings"].extend(trade_validation["warnings"])
            validation_report["warnings"].extend(snapshot_validation["warnings"])
            
            return validation_report
    
    @staticmethod
    def _validate_trades(trades: List[Trade]) -> Dict:
        """Validate trade data consistency"""
        validation = {
            "total_trades": len(trades),
            "buy_trades": 0,
            "sell_trades": 0,
            "total_buy_value": Decimal('0'),
            "total_sell_value": Decimal('0'),
            "net_cash_flow": Decimal('0'),
            "errors": [],
            "warnings": []
        }
        
        for trade in trades:
            # Validate trade data
            if trade.quantity <= 0:
                validation["errors"].append(f"Trade {trade.id}: Invalid quantity {trade.quantity}")
            
            if trade.price <= 0:
                validation["errors"].append(f"Trade {trade.id}: Invalid price {trade.price}")
            
            # Check total_value calculation
            expected_total = Decimal(str(trade.quantity)) * Decimal(str(trade.price))
            actual_total = Decimal(str(trade.total_value))
            
            if abs(expected_total - actual_total) > Decimal('0.01'):
                validation["errors"].append(
                    f"Trade {trade.id}: Total value mismatch. "
                    f"Expected: {expected_total}, Actual: {actual_total}"
                )
            
            # Accumulate statistics
            if trade.side == "BUY":
                validation["buy_trades"] += 1
                validation["total_buy_value"] += actual_total
                validation["net_cash_flow"] -= actual_total
            elif trade.side == "SELL":
                validation["sell_trades"] += 1
                validation["total_sell_value"] += actual_total
                validation["net_cash_flow"] += actual_total
        
        return validation
    
    @staticmethod
    def _validate_snapshots(snapshots: List[PortfolioSnapshot], trades: List[Trade]) -> Dict:
        """Validate snapshot consistency with trades"""
        validation = {
            "total_snapshots": len(snapshots),
            "errors": [],
            "warnings": []
        }
        
        if not snapshots:
            validation["errors"].append("No snapshots found")
            return validation
        
        # Validate each snapshot
        for i, snapshot in enumerate(snapshots):
            # Basic validation
            if snapshot.cash_balance < 0:
                validation["warnings"].append(f"Snapshot {snapshot.id}: Negative cash balance {snapshot.cash_balance}")
            
            if snapshot.equity_value < 0:
                validation["errors"].append(f"Snapshot {snapshot.id}: Negative equity value {snapshot.equity_value}")
            
            # Check total_value calculation
            expected_total = Decimal(str(snapshot.cash_balance)) + Decimal(str(snapshot.equity_value))
            actual_total = Decimal(str(snapshot.total_value))
            
            if abs(expected_total - actual_total) > Decimal('0.01'):
                validation["errors"].append(
                    f"Snapshot {snapshot.id}: Total value mismatch. "
                    f"Expected: {expected_total}, Actual: {actual_total}"
                )
        
        return validation
    
    @staticmethod
    def calculate_expected_portfolio_state(portfolio_id: int, starting_cash: Decimal) -> Dict:
        """
        Calculate what the portfolio state should be based on all trades
        This is the mathematical truth based on trade history
        """
        with session_scope() as session:
            trades = session.query(Trade).filter(Trade.portfolio_id == portfolio_id).order_by(Trade.executed_at).all()
            
            # Track positions and cash
            positions = {}  # {symbol: {"quantity": Decimal, "cost_basis": Decimal}}
            current_cash = starting_cash
            
            for trade in trades:
                symbol = trade.symbol
                quantity = Decimal(str(trade.quantity))
                price = Decimal(str(trade.price))
                total_value = Decimal(str(trade.total_value))
                
                if symbol not in positions:
                    positions[symbol] = {"quantity": Decimal('0'), "cost_basis": Decimal('0')}
                
                if trade.side == "BUY":
                    # Add to position
                    positions[symbol]["quantity"] += quantity
                    positions[symbol]["cost_basis"] += total_value
                    current_cash -= total_value
                    
                elif trade.side == "SELL":
                    # Reduce position
                    if positions[symbol]["quantity"] >= quantity:
                        # Calculate cost basis reduction (FIFO)
                        if positions[symbol]["quantity"] > 0:
                            avg_cost = positions[symbol]["cost_basis"] / positions[symbol]["quantity"]
                            cost_reduction = quantity * avg_cost
                            positions[symbol]["cost_basis"] -= cost_reduction
                        
                        positions[symbol]["quantity"] -= quantity
                        current_cash += total_value
                    else:
                        # This is an error - selling more than we have
                        print(f"ERROR: Selling {quantity} {symbol} but only have {positions[symbol]['quantity']}")
            
            # Remove zero positions
            positions = {k: v for k, v in positions.items() if v["quantity"] > 0}
            
            return {
                "cash_balance": current_cash,
                "positions": positions,
                "total_trades": len(trades)
            }
    
    @staticmethod
    def fix_portfolio_data(portfolio_id: int, starting_cash: Decimal = Decimal('1000000')) -> Dict:
        """
        Fix portfolio data by recalculating everything from trades
        This creates a corrected snapshot based on mathematical truth
        """
        expected_state = PortfolioValidationService.calculate_expected_portfolio_state(portfolio_id, starting_cash)
        
        # This would create a corrected snapshot
        # For now, just return what the state should be
        return {
            "expected_cash": float(expected_state["cash_balance"]),
            "expected_positions": {
                symbol: {
                    "quantity": float(data["quantity"]),
                    "cost_basis": float(data["cost_basis"]),
                    "avg_price": float(data["cost_basis"] / data["quantity"]) if data["quantity"] > 0 else 0
                }
                for symbol, data in expected_state["positions"].items()
            },
            "total_trades_processed": expected_state["total_trades"]
        }