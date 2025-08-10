from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Ganti sesuai domain frontend kamu di Codespaces
origins = [
    "https://special-couscous-5jj4wwrvg4j24q7r-5173.app.github.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # Bisa juga ["*"] untuk semua origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello from Backend"}
