# FTTH AutoDesigner - GitHub Codespaces Ready

## Quick start (in Codespaces)

### 1. Start PostGIS
```bash
cd backend
docker-compose up -d
```

### 2. Start backend
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Forward port 8000 in Codespaces to access the API.

### 3. Start frontend
```bash
cd ../frontend
npm install
npm run dev -- --host 0.0.0.0
```

Forward port 5173 in Codespaces to access the UI.

## Sample Data
A sample RW boundary is in `sample_boundary.geojson` for quick testing.
