from fastapi import APIRouter

router = APIRouter(
    prefix="/design",
    tags=["design"]
)

@router.get("/ping")
async def ping_design():
    return {"msg": "Design router is alive"}
