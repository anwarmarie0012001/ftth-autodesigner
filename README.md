# FTTH AutoDesigner - GitHub Codespaces Ready (Complete)
## Quick start in Codespaces

### 1. Start PostGIS
cd backend
docker-compose up -d

### 2. Start backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

### 3. Start frontend
cd ../frontend
npm install
npm run dev -- --host 0.0.0.0

Forward port 8000 (API) and 5173 (UI) in Codespaces to access the application.

Sample boundary file: `sample_boundary.geojson`
