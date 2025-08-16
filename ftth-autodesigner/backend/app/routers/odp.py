from fastapi import APIRouter, HTTPException
from typing import List, Tuple
from math import sqrt
from app.models.schemas import (
    LatLng, LineString,
    GenerateODPRequest, ODPPolygon, ODPMarker, ODPResponse
)

# Optional: gunakan shapely jika mau hasil polygon lebih "rapi"
try:
    from shapely.geometry import Polygon, Point, LineString as ShpLine, box
    from shapely.ops import unary_union
    HAVE_SHAPELY = True
except Exception:
    HAVE_SHAPELY = False

router = APIRouter(prefix="/odp", tags=["ODP"])

def latlng_to_tuple(p: LatLng) -> Tuple[float, float]:
    return (p.lng, p.lat)  # shapely: (x=lng, y=lat)

def tuple_to_latlng(t: Tuple[float, float]) -> LatLng:
    return LatLng(lat=t[1], lng=t[0])

def bbox_of_points(points: List[LatLng]):
    lats = [p.lat for p in points]
    lngs = [p.lng for p in points]
    return min(lats), min(lngs), max(lats), max(lngs)

def even_split_n(odc_poly: Polygon, n: int) -> List[Polygon]:
    """
    Bagi polygon jadi grid kotak sebanyak ~n sel (mendekati persegi).
    """
    min_lat, min_lng, max_lat, max_lng = odc_poly.bounds[1], odc_poly.bounds[0], odc_poly.bounds[3], odc_poly.bounds[2]
    width = max_lng - min_lng
    height = max_lat - min_lat
    # pilih grid mendekati persegi
    cols = int(sqrt(n))
    rows = int(round(n / max(cols, 1)))
    if cols * rows < n:
        cols += 1
    if cols * rows < n:
        rows += 1

    dx = width / cols
    dy = height / rows
    cells = []
    for r in range(rows):
        for c in range(cols):
            x0 = min_lng + c * dx
            y0 = min_lat + r * dy
            x1 = x0 + dx
            y1 = y0 + dy
            cell = box(x0, y0, x1, y1)
            inter = odc_poly.intersection(cell)
            if not inter.is_empty:
                cells.append(inter)
    # Ambil n teratas berdasarkan luas
    cells = sorted(cells, key=lambda p: p.area, reverse=True)[:n]
    return cells

def nearest_point_on_roads(pt: Point, roads: List[LineString], max_snap_m: float = 30.0, max_cross_m: float = 8.0) -> Point:
    """
    Snap ke ruas jalan terdekat jika <= max_snap_m. “Tidak menyeberang jalan > 8 m”
    diterjemahkan sebagai: jika jarak ortogonal ke garis > max_cross_m, jangan snap (tetap di centroid).
    NOTE: unit lat/lng ~ deg, jadi ini pendekatan kasar. Produksi: pakai proyeksi meter.
    """
    if not roads:
        return pt
    best = None
    best_dist = None
    for ls in roads:
        shp = ShpLine([latlng_to_tuple(p) for p in ls.points])
        candidate = shp.interpolate(shp.project(pt))
        d = pt.distance(candidate)
        if best is None or d < best_dist:
            best = candidate
            best_dist = d
    if best is None:
        return pt
    # ambang batas di degree (kasar). Anggap 1 deg ~ 111km; set ambang sangat kecil.
    # Kita ubah ambang meter->degree: meter / 111_000.
    to_deg = 1.0 / 111_000.0
    if best_dist <= max_snap_m * to_deg and best_dist <= (max_cross_m * to_deg):
        return best
    return pt

@router.post("/generate", response_model=ODPResponse)
def generate_odp(req: GenerateODPRequest):
    if not HAVE_SHAPELY:
        raise HTTPException(500, "Shapely tidak tersedia di image. Tambahkan ke requirements.txt")

    if not req.odc_boundary or len(req.odc_boundary.points) < 4:
        raise HTTPException(400, "Boundary ODC tidak valid.")

    poly = Polygon([latlng_to_tuple(p) for p in req.odc_boundary.points])
    if not poly.is_valid:
        poly = poly.buffer(0)  # perbaiki self-intersection sederhana

    # Tentukan jumlah ODP target
    # Heuristik sederhana: 6 s/d 10 sel tergantung luas
    area = poly.area
    n = req.target_count or max(6, min(10, int(round(area / (0.00002) + 4))))  # angka kasar

    cells = even_split_n(poly, n)
    polygons: List[ODPPolygon] = []
    markers: List[ODPMarker] = []

    # Siapkan roads shapely
    shp_roads = req.roads or []
    for idx, cell in enumerate(cells, start=1):
        # marker = centroid; jika ada roads, snap
        centroid = cell.centroid
        if shp_roads:
            centroid = nearest_point_on_roads(centroid, shp_roads)

        # polygon koordinat
        coords = list(cell.exterior.coords)
        polygons.append(
            ODPPolygon(
                id=idx,
                points=[tuple_to_latlng((x, y)) for x, y in coords]
            )
        )
        markers.append(
            ODPMarker(
                id=idx,
                position=tuple_to_latlng((centroid.x, centroid.y))
            )
        )

    return ODPResponse(polygons=polygons, markers=markers)
