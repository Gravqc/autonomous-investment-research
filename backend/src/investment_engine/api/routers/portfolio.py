from fastapi import APIRouter

router = APIRouter(
    prefix="/api/portfolio",
    tags=["portfolio"]
)

@router.get("/")
async def get_portfolio():
    return {
        "total_value": 125000,
        "cash": 15000,
        "positions": [
            {"symbol": "AAPL", "shares": 10},
            {"symbol": "MSFT", "shares": 5}
        ]
    }
