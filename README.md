# Autonomous Investment Research

An autonomous investment research system that ingests market data, generates AI-driven signals, executes paper trades, and tracks portfolio performance through a structured decision engine using Prefect workflows.

---

## Project Overview

### The Experiment
This is an AI-powered paper trading system that tests whether LLMs can make profitable investment decisions. The system autonomously analyzes market data, reads financial news, makes buy/sell decisions, and tracks performance over time.

### How It Works
1. **Data Collection**: Fetches real-time stock prices from Nifty 50
2. **Candidate Selection**: Filters stocks based on market conditions
3. **News Enrichment**: Gathers recent news for each stock candidate
4. **AI Decision Making**: LLM analyzes data and generates investment decisions with confidence scores
5. **Trade Execution**: Paper trades are executed with risk management rules
6. **Performance Tracking**: Portfolio snapshots track gains/losses over time

### Tech Stack
- **Backend**: FastAPI (Python) with SQLAlchemy ORM
- **Database**: PostgreSQL for storing decisions, trades, and portfolio state
- **Workflow**: Prefect for orchestrating multi-step investment pipeline
- **AI**: OpenAI GPT / Ollama for decision generation
- **Frontend**: Next.js (React) for portfolio visualization
- **Dependency Management**: Poetry

### Architecture
```
Market Data → Filter → Enrich with News → LLM Decision → Execute Trade → Store Results
                                              ↓
                                    Decision Reasoning & Confidence
                                              ↓
                                    Linked to Trade Records
```

All workflow tasks are orchestrated by Prefect, allowing full observability, retry logic, and execution history.

---

## Environment Variables

### Backend
Create a `.env` file in `backend/` with:
```env
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/investment_db
OPENAI_API_KEY=xxxxx
OLLAMA_HOST=optional
FRONTEND_ORIGIN=http://localhost:3000
PREFECT_API_URL=http://127.0.0.1:4200/api
```

### Frontend
Create a `.env.local` file in `frontend/` with:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

---

## Setup Instructions

### 1. Database Setup
Start PostgreSQL container:
```bash
docker compose up -d
```

Install backend dependencies:
```bash
cd backend
poetry install
```

Initialize database tables:
```bash
poetry run python src/investment_engine/db/init_db.py
```

Seed initial portfolio data:
```bash
poetry run python scripts/seed.py
```

### 2. Prefect Setup

Start Prefect server (in separate terminal):
```bash
cd backend
poetry run python scripts/start_prefect.py
# Or directly: prefect server start
```

Access Prefect UI at: `http://127.0.0.1:4200/dashboard`

(Optional) Start Prefect worker (in another terminal):
```bash
cd backend
poetry run python scripts/start_prefect_worker.py
# Or directly: prefect worker start --pool default-agent-pool
```

### 3. Run Backend API
Start FastAPI server (in separate terminal):
```bash
cd backend
poetry run uvicorn investment_engine.main:app --reload
```

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Running the Investment Engine

After completing setup, run the daily investment flow:
```bash
cd backend
poetry run python scripts/run_engine.py
```

This will execute the Prefect flow that:
1. Builds portfolio state
2. Fetches market data (Nifty 50)
3. Filters top stock candidates
4. Enriches with news data
5. Generates LLM-based investment decisions
6. Executes paper trades
7. Creates portfolio snapshots

Monitor flow execution in the Prefect UI at `http://127.0.0.1:4200`

---

## Notes
- Application works with local Ollama models as well as OpenAI
- Use the Poetry Python interpreter for all backend commands
- Database schemas are not using migrations yet (TBD)