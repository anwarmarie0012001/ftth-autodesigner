from fastapi import APIRouter
from pydantic import BaseModel
from shapely.geometry import Polygon

router = APIRouter()

class BoundaryRequest(BaseModel):
    boundary: list

@router.post("/odc/set")
async def set_odc_boundary(req: BoundaryRequest):
    boundary_coords = req.boundary
    boundary = Polygon(boundary_coords)

    # hitung centroid untuk ODC marker
    odc_marker = [boundary.centroid.y, boundary.centroid.x]

    # pecah boundary jadi 4 sub-grid (contoh sederhana)
    minx, miny, maxx, maxy = boundary.bounds
    dx = (maxx - minx) / 2
    dy = (maxy - miny) / 2

    odp_boundaries = []
    odp_markers = []

    for i in range(2):
        for j in range(2):
            sub_poly = Polygon([
                (minx + i*dx, miny + j*dy),
                (minx + (i+1)*dx, miny + j*dy),
                (minx + (i+1)*dx, miny + (j+1)*dy),
                (minx + i*dx, miny + (j+1)*dy)
            ])

            # hanya simpan sub boundary yang masih di dalam ODC
            if boundary.contains(sub_poly.centroid):
                coords = [(y, x) for x, y in sub_poly.exterior.coords]  # balik format [lat, lng]
                odp_boundaries.append(coords)
                odp_markers.append([sub_poly.centroid.y, sub_poly.centroid.x])

    return {
        "odc_marker": odc_marker,
        "odp_boundaries": odp_boundaries,
        "odp_markers": odp_markers
    }
