# ClauseLens

Backend and integration layer for **ClauseLens**. The user interface is owned by a separate **Lovable** React + TypeScript project; this repo does not ship a competing frontend.

- **Backend:** `backend/` — FastAPI, PostgreSQL, Docker Compose  
- **Integration:** [INTEGRATION.md](./INTEGRATION.md) — Lovable wiring, env vars, verification checklist  
- **Frontend slot:** `frontend/` — place the Lovable export here  

```bash
cd backend
docker compose up --build
curl -X POST http://localhost:8000/v1/dev/seed
```

OpenAPI: http://localhost:8000/docs
