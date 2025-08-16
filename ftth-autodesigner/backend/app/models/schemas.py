from pydantic import BaseModel, Field
from typing import List, Optional

# ---- primitive ----
class LatLng(BaseModel):
    lat: float
    lng: float

class LineString(BaseModel):
    points: List[LatLng] = Field(default_factory=list)

# ---- ODC ----
class ODCBoundary(BaseModel):
    points: List[LatLng] = Field(default_factory=list)

class ODCMarker(BaseModel):
    position: LatLng

class ODCState(BaseModel):
    boundary: Optional[ODCBoundary] = None
    marker: Optional[ODCMarker] = None

# ---- ODP ----
class GenerateODPRequest(BaseModel):
    odc_boundary: ODCBoundary
    roads: Optional[List[LineString]] = None
    target_count: Optional[int] = Field(default=None, description="Jumlah ODP yang diinginkan; None = auto")

class ODPPolygon(BaseModel):
    id: int
    points: List[LatLng]  # polygon (tertutup)

class ODPMarker(BaseModel):
    id: int
    position: LatLng

class ODPResponse(BaseModel):
    polygons: List[ODPPolygon]
    markers: List[ODPMarker]
