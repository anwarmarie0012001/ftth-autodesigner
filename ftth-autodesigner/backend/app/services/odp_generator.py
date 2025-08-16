from typing import List, Tuple
from shapely.geometry import Polygon, Point, LineString
from shapely.ops import nearest_points
from app.services.geo_utils import meters_to_deg_lat, meters_to_deg_lon

def generate_grid_cells(odc: Polygon, grid_size_m: float) -> List[Polygon]:
    """Bentuk grid bujur sangkar (aproksimasi derajat) yang menutupi ODC, lalu clip by ODC."""
    minx, miny, maxx, maxy = odc.bounds
    # gunakan latitude tengah untuk skala lon
    lat0 = (miny + maxy) / 2.0
    step_y = meters_to_deg_lat(grid_size_m)
    step_x = meters_to_deg_lon(grid_size_m, lat0)

    cells: List[Polygon] = []
    y = miny
    while y < maxy:
        x = minx
        while x < maxx:
            cell = Polygon([
                (x, y),
                (x + step_x, y),
                (x + step_x, y + step_y),
                (x, y + step_y),
            ])
            # pakai intersection supaya tidak keluar dari ODC
            inter = odc.intersection(cell)
            if not inter.is_empty and inter.area > 0:
                # gunakan polygon terbesar kalau multipolygon
                if hasattr(inter, "geoms"):
                    largest = max(list(inter.geoms), key=lambda g: g.area)
                    cells.append(largest)
                else:
                    cells.append(inter)
            x += step_x
        y += step_y
    return cells

def snap_point_to_roads(p: Point, roads: List[LineString], snap_threshold_m: float) -> Point | None:
    if not roads:
        return p  # bila tidak ada roads, kembalikan centroid (fallback)
    # ambil road terdekat
    nearest = min(roads, key=lambda r: p.distance(r))
    # jarak dihitung dalam derajat; konversi kasar: gunakan latitude lokal
    lat = p.y
    # cari jarak derajat setara threshold (pakai sumbu Y untuk pendekatan)
    from app.services.geo_utils import meters_to_deg_lat
    th_deg = meters_to_deg_lat(snap_threshold_m)
    if p.distance(nearest) <= th_deg:
        p1, p2 = nearest_points(p, nearest)
        return p2
    return None

def generate_odp_boundaries(
    odc_polygon: Polygon,
    roads: List[LineString],
    grid_size_m: float = 60.0,
    snap_threshold_m: float = 8.0,
) -> Tuple[List[Polygon], List[Point]]:
    """
    Hasilkan boundary ODP (grid cell yang ter-clip di ODC) + titik ODP:
    - Titik = centroid cell di-snap ke jalan terdekat bila <= snap_threshold_m.
    - Bila tidak ada jalan atau terlalu jauh, cell tetap dibuat tapi titik = centroid (fallback).
    """
    cells = generate_grid_cells(odc_polygon, grid_size_m)
    odp_points: List[Point] = []
    for cell in cells:
        c = cell.representative_point()  # lebih aman dari centroid untuk polygon kompleks
        snapped = snap_point_to_roads(c, roads, snap_threshold_m)
        odp_points.append(snapped or c)
    return cells, odp_points
