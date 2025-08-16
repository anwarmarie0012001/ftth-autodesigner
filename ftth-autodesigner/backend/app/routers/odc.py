from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Tuple

router = APIRouter(
    prefix="/odc",
    tags=["ODC"]
)

class BoundaryRequest(BaseModel):
    boundary: List[Tuple[float, float]]

class MarkerRequest(BaseModel):
    lat: float
    lng: float

# Simpan sementara di memory (nanti bisa DB)
odc_boundary = None
odc_marker = None

@router.post("/boundary")
async def set_boundary(req: BoundaryRequest):
    global odc_boundary
    odc_boundary = req.boundary
    return {"message": "Boundary ODC saved", "boundary": odc_boundary}

@router.post("/marker")
async def set_marker(req: MarkerRequest):
    global odc_marker
    odc_marker = (req.lat, req.lng)
    return {"message": "ODC Marker saved", "marker": odc_marker}
