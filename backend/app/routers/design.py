# app/routers/design.py
from fastapi import APIRouter
from pydantic import BaseModel
from shapely.geometry import Point, Polygon
import random

router = APIRouter()

# Model request dari frontend
class FTTHRequest(BaseModel):
    boundary: list  # [[lat, lng], [lat, lng], ...]
    odc_location: list  # [lat, lng]

@router.post("/generate_odp")
def generate_odp(data: FTTHRequest):
    """
    Generate titik-titik ODP di dalam boundary ODC
    """
    # 1. Konversi koordinat dari Leaflet [lat, lng] → (lng, lat) untuk Shapely
    boundary_coords = [(coord[1], coord[0]) for coord in data.boundary]
    odc_point = (data.odc_location[1], data.odc_location[0])

    polygon = Polygon(boundary_coords)

    # Debug: print koordinat polygon & ODC
    print("Boundary (lng, lat):", boundary_coords)
    print("ODC Location (lng, lat):", odc_point)

    # 2. Generate titik acak di dalam polygon (contoh: 5 ODP)
    odp_points = []
    minx, miny, maxx, maxy = polygon.bounds

    attempt = 0
    while len(odp_points) < 5 and attempt < 200:
        attempt += 1
        random_point = Point(
            random.uniform(minx, maxx),
            random.uniform(miny, maxy)
        )
        if polygon.contains(random_point):
            odp_points.append(random_point)

    # 3. Convert hasil ke format Leaflet [lat, lng]
    odp_leaflet = [[p.y, p.x] for p in odp_points]

    # Debug: print jumlah ODP yang dihasilkan
    print(f"Generated {len(odp_leaflet)} ODP points inside polygon")

    # 4. Response ke frontend
    return {
        "status": "success",
        "message": "ODP generated successfully",
        "boundary": data.boundary,  # tetap format Leaflet
        "odc_location": data.odc_location,
        "odp_points": odp_leaflet
    }
