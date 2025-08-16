from pydantic import BaseModel
from typing import List, Optional

# -----------------------------------
# Model dasar koordinat
# -----------------------------------
class LatLng(BaseModel):
    lat: float
    lng: float


# -----------------------------------
# Schema untuk ODC
# -----------------------------------
class ODCBoundary(BaseModel):
    points: List[LatLng]

class ODCMarker(BaseModel):
    lat: float
    lng: float

class ODCData(BaseModel):
    boundary: Optional[List[LatLng]] = None
    marker: Optional[ODCMarker] = None


# -----------------------------------
# Schema untuk ODP
# -----------------------------------
class GenerateODPRequest(BaseModel):
    boundary: List[LatLng]   # polygon ODC
    grid_size: int = 60      # default grid size
    snap_th: int = 8         # default snap threshold

class ODPBoundary(BaseModel):
    points: List[LatLng]

class ODPPoint(BaseModel):
    lat: float
    lng: float

class ODPResult(BaseModel):
    odp_boundaries: List[ODPBoundary]
    odp_points: List[ODPPoint]


# -----------------------------------
# Alias agar kompatibel dengan kode lama
# -----------------------------------
ODPResponse = ODPResult
