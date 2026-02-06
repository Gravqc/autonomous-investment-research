from fastapi import APIRouter

router = APIRouter(
    prefix="/api/decisions",
    tags=["decisions"]
)

@router.get("/")
async def get_decisions():
    return [
        {
            "symbol": "NVDA",
            "action": "BUY",
            "confidence": 0.82
        },
        {
            "symbol": "TSLA",
            "action": "SELL",
            "confidence": 0.65
        }
    ]
