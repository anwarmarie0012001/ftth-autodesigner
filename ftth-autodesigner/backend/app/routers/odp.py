from fastapi import APIRouter, HTTPException
from shapely.geometry import shape, LineString
from app.models.schemas import (
    GenerateODPRequest,
    ODPResponse,
)
from app.services.odp_generator import generate_odp_boundaries
from app.services.geo_utils import ensure_polygon
from app.services.road_utils import parse_roads_from_geojson

router = APIRouter(prefix="/odp")

@router.post("/generate", response_model=ODPResponse)
def generate_odp(req: GenerateODPRequest):
    if not req.odc_feature or not req.odc_feature.geometry:
        raise HTTPException(status_code=400, detail="Missing ODC GeoJSON feature.")

    odc_geom = ensure_polygon(shape(req.odc_feature.geometry))
    roads: list[LineString] = parse_roads_from_geojson(req.roads_geojson) if req.roads_geojson else []

    odp_polys, odp_points = generate_odp_boundaries(
        odc_polygon=odc_geom,
        roads=roads,
        grid_size_m=req.grid_size_m or 60.0,
        snap_threshold_m=req.snap_threshold_m or 8.0,
    )

    return ODPResponse(
        odp_boundaries=[p.__geo_interface__ for p in odp_polys],
        odp_points=[pt.__geo_interface__ for pt in odp_points],
        meta={
            "grid_size_m": req.grid_size_m or 60.0,
            "snap_threshold_m": req.snap_threshold_m or 8.0,
            "roads_used": len(roads),
        },
    )
