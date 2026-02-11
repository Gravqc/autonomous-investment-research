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
This will start a container with postgres.
    - docker compose up -d

Create tables (NOTE: Not migration as final db schemas are tbd) 
    - poetry run python src/investment_engine/db/init_db.py
        
Create entry in portfolio, portfolio_snapshot table (Intial config, feel free to change as per req)
    - poetry run python scripts/seed.py

- Environment variables:
    - POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/investment_db
    - OPENAI_API_KEY=xxxxx
        - Application works with local ollama model as well.
    - OLLAMA_HOST=optional
    - SECRET_KEY=supersecret
    - FRONTEND_ORIGIN=http://localhost:3000

- To Run the application from start to finish after initial setup: 
    poetry run ptyhon poetry run scripts/run_engine
NOTE: Make sure you are using the poetry python interpretor