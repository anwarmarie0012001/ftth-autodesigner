from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import design  # import router FTTH

# Buat instance FastAPI
app = FastAPI(title="FTTH AutoDesigner Backend")

# Middleware CORS untuk mengizinkan akses dari frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # sementara semua origin boleh, nanti bisa dibatasi
    allow_methods=["*"],
    allow_headers=["*"]
)

# Endpoint root untuk test koneksi
@app.get("/")
def root():
    return {"message": "Hello from Backend"}

# Registrasi router design
app.include_router(design.router)
