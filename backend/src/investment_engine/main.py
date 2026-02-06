from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from investment_engine.api.router import router
from investment_engine.settings import settings

app = FastAPI()

# CORS: only allow calls from the configured frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def load_settings() -> None:
    """
    Trigger settings validation on startup so env issues surface early.
    """
    # Accessing `settings` ensures the .env is parsed and validated.
    app.state.settings = settings


app.include_router(router)