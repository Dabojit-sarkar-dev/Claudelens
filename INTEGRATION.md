# ClauseLens — Backend & Lovable Integration

ClauseLens splits ownership clearly: **Lovable owns the UI**; this repository provides the **FastAPI backend** and integration tooling. The frontend is a separate Lovable-generated React + TypeScript app; do not add a second UI here.

## Quick start (backend only)

```bash
cd backend
docker compose up --build
```

In another terminal, seed demo data:

```bash
curl -X POST http://localhost:8000/v1/dev/seed
```

OpenAPI: [http://localhost:8000/docs](http://localhost:8000/docs)  
OpenAPI JSON: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

## Seed users (login)

| Email | Password | Role |
|-------|----------|------|
| `admin@clauselens.local` | `ClauseLens123!` | admin |
| `reviewer@clauselens.local` | `ClauseLens123!` | reviewer |

### Login flow

```bash
curl -s -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clauselens.local","password":"ClauseLens123!"}'
```

Use the returned `access_token` as `Authorization: Bearer <token>` on all `/v1/*` routes except `/v1/auth/login` and `/v1/dev/seed`.

```bash
curl -s http://localhost:8000/v1/auth/me -H "Authorization: Bearer TOKEN"
```

Alternative seed (CLI, same data as `POST /v1/dev/seed`):

```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL=postgresql+psycopg2://clauselens:clauselens@localhost:5432/clauselens
python scripts/seed.py
```

## Connect the Lovable frontend

1. Export or sync the Lovable project into `frontend/` (see `frontend/README.md`).
2. Start the backend (`docker compose up` in `backend/`).
3. From the repo root:

   ```bash
   npm install
   npm run generate-api
   ```

   This writes `frontend/src/types/api.generated.ts` from the live OpenAPI schema.

4. In the Lovable app environment:

   ```env
   BACKEND_URL=http://localhost:8000
   VITE_API_BASE_URL=http://localhost:8000
   VITE_USE_MOCK_API=false
   ```

5. Run the frontend separately (Vite default port **5173**):

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

CORS allows `http://localhost:3000` and `http://localhost:5173`. Add production origins via `FRONTEND_ORIGINS` (comma-separated) on the API service.

## Environment variables (API)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret |
| `FRONTEND_ORIGINS` | CORS allowlist (comma-separated) |
| `USE_MOCK_API` | When `true`, completes uploads instantly; JSON shapes stay identical |

Copy `backend/.env.example` to `backend/.env` for local non-Docker runs.

## API contract highlights

- Versioned REST under `/v1`
- Pydantic models define request/response bodies (see `backend/app/schemas.py`)
- Errors:

  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Human-readable explanation",
      "details": {}
    }
  }
  ```

- Findings always include verified citations (quote checked against stored paragraph text before response).
- Contract upload: `POST /v1/contracts` (`multipart/form-data`: `file`, `workspace_id`, optional `title`) → **202** with `document_id`, `status`, `run_id`.

## Integration verification checklist

With `VITE_USE_MOCK_API=false`:

1. Log in with a seed user; confirm `/v1/auth/me` and workspace list.
2. Upload a PDF via the Lovable UI; poll contract status until `ready`.
3. Open findings; load a citation page URL in the document viewer.
4. Approve, edit, or reject a finding with `expected_updated_at`; confirm audit history on `GET /v1/findings/{id}`.
5. Run `POST /v1/evaluations/run` and display metrics in the UI.
6. Confirm CORS, 401/403 handling, loading states, and that users only see contracts in their workspaces.

## Troubleshooting

### CORS errors in the browser

- Ensure the frontend origin is listed in `FRONTEND_ORIGINS`.
- Restart the API after changing env vars.

### 401 on all routes

- Confirm `Authorization: Bearer <access_token>` header.
- Token expires after 24h by default; log in again.

### 409 on finding review

- Pass the current `updated_at` from the finding as `expected_updated_at` (optimistic locking).

### `generate-api` fails

- Backend must be up at `http://localhost:8000`.
- Override URL: `OPENAPI_URL=http://localhost:8000/openapi.json npm run generate-api`.

### Database connection errors (local run without Docker)

- Start Postgres via `docker compose up db` or use full `docker compose up`.
- Match `DATABASE_URL` to your Postgres instance.

### Empty contract list

- Call `POST /v1/dev/seed` or upload a new contract.
- User must belong to the contract’s workspace (seed users share one workspace).

## Repository layout

```
backend/          FastAPI app, Docker Compose, seed CLI
frontend/         Lovable React app (you add this)
scripts/          OpenAPI → TypeScript generator
INTEGRATION.md    This file
```

## Health & metrics

- `GET /health` — liveness
- `GET /metrics` — Prometheus text format
