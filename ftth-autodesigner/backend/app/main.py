from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import odc, odp

app = FastAPI(title="FTTH AutoDesigner API", version="0.1.0")

# CORS – izinkan akses dari Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # aman untuk DEV; produksi sebaiknya spesifik
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan routers
app.include_router(odc.router)
app.include_router(odp.router)

@app.get("/health")
def health():
    return {"status": "ok"}
