from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/odc", tags=["ODC"])

# -----------------------------
# Model data
# -----------------------------
class LatLng(BaseModel):
    lat: float
    lng: float

class ODCBoundary(BaseModel):
    points: List[LatLng]

class ODCMarker(BaseModel):
    lat: float
    lng: float

class ODCData(BaseModel):
    boundary: Optional[List[LatLng]] = None
    marker: Optional[ODCMarker] = None


# -----------------------------
# Penyimpanan sementara (in-memory)
# -----------------------------
odc_state: ODCData = ODCData()


# -----------------------------
# Endpoint
# -----------------------------
@router.post("/set-boundary")
def set_boundary(boundary: ODCBoundary):
    """Simpan boundary ODC (list titik polygon)."""
    global odc_state
    odc_state.boundary = boundary.points
    return {"status": "ok", "boundary_points": boundary.points}


@router.post("/set-marker")
def set_marker(marker: ODCMarker):
    """Simpan marker ODC (titik koordinat)."""
    global odc_state
    odc_state.marker = marker
    return {"status": "ok", "marker": marker}


@router.get("/get")
def get_odc():
    """Ambil data ODC (boundary + marker)."""
    return {
        "boundary": odc_state.boundary,
        "marker": odc_state.marker,
    }
