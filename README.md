
# FTTH Autodesigner

A simple full-stack template for automatically designing FTTH ODP placement inside ODC boundaries.

## Stack
- **Backend:** FastAPI (Python), simple geo utilities with Shapely
- **Frontend:** React + Vite + Leaflet (map), Axios
- **Docker:** docker-compose for dev

## Quick Start (Dev)
```bash
docker compose up --build
# Frontend: http://localhost:5173
# Backend docs: http://localhost:8000/docs
```
## Environment
- Frontend reads `VITE_BACKEND_URL` (default set by docker-compose to `http://localhost:8000`).
- You can also create `frontend/.env` (or `.env.local`) with:
```
VITE_BACKEND_URL=http://localhost:8000
```

## What it does
- Load an ODC boundary (polygon) and building points on the map (sample generated).
- Click **Auto-Place ODP** to call the backend:
  - Buildings are grouped in batches (default capacity=16) and each group's centroid becomes an ODP.
  - Points outside boundary are ignored (toggle on UI).
- ODP and ODC markers use icons from `/assets`.

## API
- `POST /design/auto-odp` → compute ODP centroids from buildings and boundary
- `POST /design/check` → check if a point lies inside boundary
- `GET /health` → service health

Open API docs: `http://localhost:8000/docs`

## Notes
- No DB. Everything runs in memory.
- Extend with clustering, street snapping, capacity-aware splitting, etc.
