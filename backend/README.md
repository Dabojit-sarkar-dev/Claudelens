# ClauseLens Backend

FastAPI + Python 3.11 service for the ClauseLens contract review platform. See [INTEGRATION.md](../INTEGRATION.md) for Lovable frontend wiring.

## Run with Docker Compose

```bash
docker compose up --build
```

## Local development (API on host)

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
copy .env.example .env
docker compose up db -d
uvicorn app.main:app --reload --port 8000
```

Seed: `curl -X POST http://localhost:8000/v1/dev/seed`
