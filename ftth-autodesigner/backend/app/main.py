from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from app.routers import odc, odp, design

# Buat instance FastAPI
app = FastAPI(
    title="FTTH Auto Designer API",
    description="Backend untuk aplikasi FTTH Auto Designer",
    version="1.0.0",
)

# Konfigurasi CORS (supaya frontend bisa akses backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Bisa dibatasi misalnya ke ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register semua router
app.include_router(design.router)
app.include_router(odc.router)
app.include_router(odp.router)


# Root endpoint sederhana
@app.get("/")
async def root():
    return {"message": "FTTH Auto Designer Backend is running 🚀"}
