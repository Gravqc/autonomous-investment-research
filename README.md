# autonomous-investment-research
An autonomous investment research system that ingests market data, generates AI-driven signals, executes paper trades, and tracks portfolio performance through a structured decision engine.

To run FrontEnd:
cd frontend, npm install, npm run dev
- Environment Variables:
    - NEXT_PUBLIC_API_URL=http://localhost:3000
    - NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000

To Run Backend:
- cd backend, poetry install, poetry run uvicorn investment_engine.main:app --reload
- Environment variables:
    - POSTGRES_URL=postgresql://user:pass@localhost:5432/investments
    - OPENAI_API_KEY=xxxxx
    - OLLAMA_HOST=optional
    - SECRET_KEY=supersecret
    - FRONTEND_ORIGIN=http://localhost:3000