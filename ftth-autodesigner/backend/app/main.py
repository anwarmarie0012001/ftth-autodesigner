from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import design, odc, odp

# Inisialisasi FastAPI
app = FastAPI()

# Middleware untuk CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ganti sesuai domain frontend kamu
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan router
app.include_router(design.router)
app.include_router(odc.router)
app.include_router(odp.router)
