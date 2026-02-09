# autonomous-investment-research
An autonomous investment research system that ingests market data, generates AI-driven signals, executes paper trades, and tracks portfolio performance through a structured decision engine.

To run FrontEnd:
cd frontend, npm install, npm run dev
- Environment Variables:
    - NEXT_PUBLIC_API_URL=http://localhost:3000
    - NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000

To Run Backend:
- cd backend, poetry install, poetry run uvicorn investment_engine.main:app --reload
- PostGres:
    - docker compose up -d
        This will start a container with postgres.
    - poetry run src/investment_engine/db/init_db.py
        Create tables (NOTE: Not migration as final db schemas are tbd) 
    - poetry run scripts/seed.py
        Create sample entry in tables
    - poetry run scripts/run_engine.py 
        This should populate the trades and portfolio_snapshot tables with some mock entries.
- Environment variables:
    - POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/investment_db
    - OPENAI_API_KEY=xxxxx
    - OLLAMA_HOST=optional
    - SECRET_KEY=supersecret
    - FRONTEND_ORIGIN=http://localhost:3000

NOTE: Make sure you are using the poetry python interpretor